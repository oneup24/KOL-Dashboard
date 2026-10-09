const PublicFooter = () => (
  <footer className="border-t border-slate-100 bg-slate-50 mt-auto">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-slate-500">
      <p>© {new Date().getFullYear()} FX Creations. All rights reserved.</p>
      <p>
        Questions? Reach out to <a className="text-slate-700 underline" href="mailto:kol@fxcreations.com">kol@fxcreations.com</a>
      </p>
    </div>
  </footer>
);

export default PublicFooter;
