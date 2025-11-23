export default function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#111", color: "#fff" }}>
      <a href="/" style={{ marginRight: "1rem", color: "#fff" }}>Scriptoplay</a>
      <a href="/signup" style={{ marginRight: "1rem", color: "#fff" }}>Signup</a>
      <a href="/signin" style={{ marginRight: "1rem", color: "#fff" }}>Sign In</a>
      <a href="/updates" style={{ color: "#fff" }}>Updates</a>
    </nav>
  );
}
