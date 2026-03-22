'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProjects, getProfiles, getCamps } from '@/lib/supabase';
import { ProjectCard, SectionHeader } from '@/components/UI';
import { SDG_LIST } from '@/lib/types';
import type { Project, Profile, Camp } from '@/lib/types';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getProjects(), getProfiles(), getCamps()]).then(([p, u, c]) => {
      setProjects(p);
      setProfiles(u);
      setCamps(c);
      setLoaded(true);
    });
  }, []);

  const featured = projects.slice(0, 3);
  const coveredSdgs = [...new Set(projects.flatMap(p => (p.sdgs || []).map(s => s.id)))];

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Hero */}
      <section className="pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-gradient-radial from-black/[0.012] to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[11.5px] font-semibold uppercase tracking-widest text-text-tertiary mb-4">Innovation Platform</p>
          <h1 className="font-display text-[clamp(40px,5.5vw,64px)] leading-[1.05] tracking-tight max-w-[700px]">
            Where ideas become<br /><em>global impact.</em>
          </h1>
          <p className="text-[17px] text-text-secondary leading-relaxed max-w-[480px] mt-5">
            Flox Labs connects creators, engineers, and thinkers to build projects
            aligned with the UN Sustainable Development Goals.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-2.5 text-[14px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors no-underline">
              Explore Projects
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/></svg>
            </Link>
            <Link href="/members" className="inline-flex items-center px-6 py-2.5 text-[14px] font-medium bg-white text-text-primary border border-border rounded-lg hover:bg-gray-50 transition-colors no-underline">
              Meet the Team
            </Link>
          </div>
          <div className="flex gap-12 mt-14 pt-8 border-t border-border flex-wrap">
            {[
              { num: projects.length, label: 'Active Projects' },
              { num: profiles.length, label: 'Lab Members' },
              { num: coveredSdgs.length, label: 'SDGs Covered' },
              { num: camps.length, label: 'Upcoming Camps' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display text-[32px] tracking-tight">{s.num}</div>
                <div className="text-[13px] text-text-tertiary mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      {featured.length > 0 && (
        <section className="py-12 border-t border-border-light">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex justify-between items-end mb-7">
              <div>
                <p className="text-[11.5px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">Featured</p>
                <h2 className="font-display text-[36px] tracking-tight">Latest Projects</h2>
              </div>
              <Link href="/explore" className="text-[13.5px] text-text-secondary hover:text-text-primary flex items-center gap-1 no-underline">
                View all
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
              {featured.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Framework */}
      <section className="py-16 bg-[#fafafa] border-y border-border-light">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-[560px] mx-auto">
            <p className="text-[11.5px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">Our Framework</p>
            <h2 className="font-display text-[28px] tracking-tight">Build. Measure. Impact.</h2>
            <p className="text-[15px] text-text-secondary mt-3 leading-relaxed max-w-[460px] mx-auto">
              Every project on Flox Labs is tied to at least one UN Sustainable Development Goal, ensuring real-world relevance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 stagger">
            {[
              { num: '01', title: 'Ideate', desc: 'Identify a problem tied to global sustainability challenges and design a solution.' },
              { num: '02', title: 'Build', desc: 'Prototype, test, and iterate using the tools and community at Flox Labs.' },
              { num: '03', title: 'Scale', desc: 'Connect with mentors, camps, and partners to bring your project to real communities.' },
            ].map(s => (
              <div key={s.num} className="p-6">
                <span className="font-display text-[32px] text-text-tertiary">{s.num}</span>
                <h3 className="text-[17px] font-semibold mt-2">{s.title}</h3>
                <p className="text-[14px] text-text-secondary leading-relaxed mt-1.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDGs */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[11.5px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">Sustainability</p>
          <h2 className="font-display text-[36px] tracking-tight mb-6">SDGs We Cover</h2>
          <div className="flex flex-wrap gap-1.5">
            {SDG_LIST.map(s => {
              const count = projects.filter(p => (p.sdgs || []).some(x => x.id === s.id)).length;
              return (
                <div
                  key={s.id}
                  className="px-3 py-1.5 rounded-md text-[12.5px] font-medium border transition-colors"
                  style={{
                    borderColor: count > 0 ? s.color + '30' : '#f0f0f0',
                    background: count > 0 ? s.color + '10' : '#fafafa',
                    color: count > 0 ? s.color : '#999',
                  }}
                >
                  {s.id}. {s.name} {count > 0 && <span className="opacity-60">({count})</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
