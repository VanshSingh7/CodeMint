import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="px-5 sm:px-8 py-10 sm:py-16 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl sm:text-3xl font-semibold text-fg mb-3">
        Write cleaner code, one submission at a time
      </h1>
      <p className="text-sm text-fg-muted mb-8 leading-relaxed">
        CodeMint runs your code, checks it against your test cases, and
        gives you clean-code feedback after every submit — so you improve
        as you go, not just get a pass/fail.
      </p>
      <Link
        to="/editor"
        className="inline-block px-4 py-2 rounded-md bg-accent-emphasis text-white text-sm font-medium"
      >
        Start coding
      </Link>
    </div>
  );
}