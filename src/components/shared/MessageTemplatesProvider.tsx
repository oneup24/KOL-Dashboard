import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedMessageTemplates } from "@/data/messageTemplates";
import type { MessageScope, MessageTemplate } from "@/types";

interface MessageTemplatesContextValue {
  /** Templates the marketer has edited — seeded from `seedMessageTemplates`. */
  templates: MessageTemplate[];
  /** Replace the body of a single template. */
  updateTemplateBody: (id: string, body: string) => void;
  /** Restore every template to the shipped copy. */
  resetTemplates: () => void;
  /** All templates registered for a given scope. */
  byScope: (scope: MessageScope) => MessageTemplate[];
}

const MessageTemplatesContext = createContext<MessageTemplatesContextValue | null>(
  null,
);

/**
 * Holds the editable copy of the WhatsApp message templates.
 *
 * There is no backend, so edits live in React state for the session.
 */
export const MessageTemplatesProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>(seedMessageTemplates);

  const updateTemplateBody = useCallback((id: string, body: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, body } : t)),
    );
  }, []);

  const resetTemplates = useCallback(() => {
    setTemplates(seedMessageTemplates);
  }, []);

  const byScope = useCallback(
    (scope: MessageScope) => templates.filter((t) => t.scope === scope),
    [templates],
  );

  const value = useMemo(
    () => ({ templates, updateTemplateBody, resetTemplates, byScope }),
    [templates, updateTemplateBody, resetTemplates, byScope],
  );

  return (
    <MessageTemplatesContext.Provider value={value}>
      {children}
    </MessageTemplatesContext.Provider>
  );
};

export const useMessageTemplates = (): MessageTemplatesContextValue => {
  const ctx = useContext(MessageTemplatesContext);
  if (!ctx) {
    throw new Error("useMessageTemplates must be used within a MessageTemplatesProvider");
  }
  return ctx;
};
