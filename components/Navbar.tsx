import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu is open (optional)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
  }, [open]);

  return (
    <header className="bg-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="text-lg font-bold">Scriptoplay</a>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="/signup" className="hover:underline">Signup</a>
          <a href="/signin" className="hover:underline">Sign In</a>
          <a href="/updates" className="hover:underline">Updates</a>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-xl" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-dark px-6 pb-4 flex flex-col gap-4 text-sm"
          >
            <a href="/signup" onClick={() => setOpen(false)}>Signup</a>
            <a href="/signin" onClick={() => setOpen(false)}>Sign In</a>
            <a href="/updates" onClick={() => setOpen(false)}>Updates</a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}






/* export default function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#111", color: "#fff" }}>
      <a href="/" style={{ marginRight: "1rem", color: "#fff" }}>Scriptoplay</a>
      <a href="/signup" style={{ marginRight: "1rem", color: "#fff" }}>Signup</a>
      <a href="/signin" style={{ marginRight: "1rem", color: "#fff" }}>Sign In</a>
      <a href="/updates" style={{ color: "#fff" }}>Updates</a>
    </nav>
  );
}
*/