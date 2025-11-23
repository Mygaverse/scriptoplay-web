export default function TailwindHero() {
  return (
    <section className="bg-dark text-white text-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-4">Scriptoplay with Tailwind</h1>
      <p className="text-lg mb-6">This section is styled using Tailwind CSS instead of styled-components.</p>
      <div className="space-x-4">
        <a href="/signup" className="bg-primary text-white py-2 px-4 rounded hover:opacity-90">Get Started</a>
        <a href="/updates" className="border border-white py-2 px-4 rounded text-white hover:bg-white hover:text-dark">See Updates</a>
      </div>
    </section>
  );
}
