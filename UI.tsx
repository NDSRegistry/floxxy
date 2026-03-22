'use client';

import { useEffect, useState } from 'react';
import { getProjects } from '@/lib/supabase';
import { ProjectCard, SectionHeader, EmptyState } from '@/components/UI';
import { SDG_LIST } from '@/lib/types';
import type { Project } from '@/lib/types';

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [sdgFilter, setSdgFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProjects().then(p => { setProjects(p); setLoaded(true); });
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchSdg = !sdgFilter || (p.sdgs || []).some(s => s.id === sdgFilter);
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchSdg && matchStatus;
  });

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-in py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader label="Projects" title="Explore" subtitle="Browse all projects built by our lab community." />

        <div className="flex gap-3 mt-6 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <select
            value={sdgFilter || ''}
            onChange={e => setSdgFilter(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 bg-white min-w-[160px]"
          >
            <option value="">All SDGs</option>
            {SDG_LIST.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 bg-white min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="In Development">In Development</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7 stagger">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <EmptyState
            icon={<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4"/><line x1="10" y1="10" x2="14" y2="14"/></svg>}
            message="No projects match your filters."
          />
        )}
      </div>
    </div>
  );
}
