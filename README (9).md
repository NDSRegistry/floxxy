'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-border pt-12 pb-8 mt-0">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Flox Labs" width={28} height={28} className="rounded" />
              <span className="font-semibold text-[15px]">Flox Labs</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mt-3 max-w-[280px]">
              An innovation platform connecting technology with the UN Sustainable Development Goals.
            </p>
          </div>
          <div>
            <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-text-tertiary mb-3.5">Platform</h4>
            <Link href="/explore" className="block text-[13.5px] text-text-secondary hover:text-text-primary mb-2 no-underline">Explore</Link>
            <Link href="/members" className="block text-[13.5px] text-text-secondary hover:text-text-primary mb-2 no-underline">Members</Link>
            <Link href="/magazine" className="block text-[13.5px] text-text-secondary hover:text-text-primary mb-2 no-underline">Magazine</Link>
            <Link href="/camps" className="block text-[13.5px] text-text-secondary hover:text-text-primary mb-2 no-underline">Camps</Link>
          </div>
          <div>
            <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-text-tertiary mb-3.5">Company</h4>
            <span className="block text-[13.5px] text-text-secondary mb-2 cursor-default">About</span>
            <span className="block text-[13.5px] text-text-secondary mb-2 cursor-default">Contact</span>
            <span className="block text-[13.5px] text-text-secondary mb-2 cursor-default">Careers</span>
          </div>
          <div>
            <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-text-tertiary mb-3.5">Legal</h4>
            <span className="block text-[13.5px] text-text-secondary mb-2 cursor-default">Privacy</span>
            <span className="block text-[13.5px] text-text-secondary mb-2 cursor-default">Terms</span>
          </div>
        </div>
        <div className="mt-10 pt-5 border-t border-border-light flex flex-col sm:flex-row justify-between text-[12.5px] text-text-tertiary gap-2">
          <span>&copy; 2026 Flox Labs. All rights reserved.</span>
          <span>Built with purpose.</span>
        </div>
      </div>
    </footer>
  );
}
