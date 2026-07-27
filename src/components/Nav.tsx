import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="flex items-center gap-6 border-b border-neutral-200 px-6 py-4">
      <Link href="/" className="font-semibold">Enterprise360</Link>
      <Link href="/dashboard/executive">Dashboard</Link>
      <Link href="/case-study">Case Study</Link>
    </nav>
  );
}
