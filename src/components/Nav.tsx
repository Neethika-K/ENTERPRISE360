import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="flex items-center gap-8 border-b border-line bg-bg px-6 py-3">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-accent" aria-hidden>⬢</span>
        <span className="font-display text-sm font-semibold tracking-tight">ENTERPRISE360</span>
      </Link>
      <div className="flex items-center gap-6 text-sm text-muted">
        <Link href="/dashboard/executive" className="hover:text-text">Console</Link>
        <Link href="/case-study" className="hover:text-text">Case Study</Link>
        <Link href="/delivery" className="hover:text-text">Delivery</Link>
      </div>
    </nav>
  );
}
