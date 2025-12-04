import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="font-bold text-xl text-indigo-600">Scriptoplay</span>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        <Link href="/dashboard" className="block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md">
          Overview
        </Link>
        <Link href="/dashboard/projects" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
          My Projects
        </Link>
        <Link href="/dashboard/settings" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
          Settings
        </Link>
      </nav>
    </aside>
  );
}