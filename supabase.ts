'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProject } from '@/lib/supabase';
import { Avatar, SDGTag, StatusBadge, RoleTag } from '@/components/UI';
import type { Project } from '@/lib/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (params.id) {
      getProject(params.id as string).then(p => { setProject(p); setLoaded(true); });
    }
  }, [params.id]);

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!project) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <Link href="/explore" className="text-sm text-text-secondary hover:text-text-primary mt-2 inline-block">← Back to Explore</Link>
      </div>
    );
  }

  const sdgs = project.sdgs || [];

  return (
    <div className="animate-in py-12">
      <div className="max-w-[720px] mx-auto px-6">
        <Link href="/explore" className="inline-flex items-center gap-1 text-[13px] text-text-secondary hover:text-text-primary mb-6 no-underline">
          ← Back to Explore
        </Link>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {sdgs.map(s => <SDGTag key={s.id} sdg={s} />)}
        </div>

        <h1 className="font-display text-[36px] tracking-tight">{project.title}</h1>

        <div className="flex items-center gap-3 mt-4 pb-6 border-b border-border-light">
          {project.creator && (
            <>
              <Avatar name={project.creator.name} size="sm" />
              <div>
                <span className="text-[14px] font-medium">{project.creator.name}</span>
                <span className="text-[13px] text-text-tertiary ml-2">{project.creator.role}</span>
              </div>
            </>
          )}
          <div className="ml-auto">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Project visual */}
        <div className="mt-6 h-60 bg-[#fafafa] rounded-xl flex items-center justify-center relative overflow-hidden border border-border-light">
          <svg className="absolute inset-0 opacity-20" width="100%" height="100%" viewBox="0 0 720 240" preserveAspectRatio="none">
            {sdgs.map((s, i) => (
              <circle key={s.id} cx={200 + i * 180} cy={120} r={100 - i * 20} fill={s.color} opacity={0.06 + i * 0.02} />
            ))}
          </svg>
          <span className="font-display text-5xl text-text-tertiary opacity-30 relative z-10">{project.title.charAt(0)}</span>
        </div>

        <div className="mt-7">
          <p className="text-[16px] leading-[1.75] text-gray-700 whitespace-pre-line">{project.description}</p>
        </div>

        {project.media_link && (
          <div className="mt-6">
            <a href={project.media_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              External Link
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M5 1H1v10h10V7"/><path d="M7 1h4v4"/><line x1="11" y1="1" x2="5" y2="7"/></svg>
            </a>
          </div>
        )}

        <div className="mt-7 p-4 bg-[#fafafa] rounded-lg border border-border-light">
          <span className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">Created</span>
          <p className="text-[14px] mt-1">
            {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
