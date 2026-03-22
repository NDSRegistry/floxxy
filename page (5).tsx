'use client';

import { useEffect, useState } from 'react';
import { getProfiles } from '@/lib/supabase';
import { Avatar, RoleTag, SectionHeader } from '@/components/UI';
import { ROLE_HIERARCHY } from '@/lib/types';
import type { Profile } from '@/lib/types';

const ROLE_COLORS: Record<string, string> = {
  'Lab Director': '#1a2332',
  'Lab Manager': '#2563eb',
  'Lab Staff': '#16a34a',
  'Genius': '#9333ea',
};

export default function MembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProfiles().then(p => { setProfiles(p); setLoaded(true); });
  }, []);

  const grouped = [...ROLE_HIERARCHY].reverse().map(role => ({
    role,
    members: profiles.filter(u => u.role === role),
  })).filter(g => g.members.length > 0);

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-in py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader label="Community" title="Lab Members" subtitle="The people behind the projects." />

        {grouped.map(group => (
          <div key={group.role} className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[18px] font-semibold tracking-tight">{group.role}s</h2>
              <span className="text-[12px] text-text-tertiary bg-[#fafafa] px-2 py-0.5 rounded">{group.members.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
              {group.members.map(u => (
                <div key={u.id} className="bg-white border border-border rounded-xl p-5 flex gap-4 items-start hover:shadow-card hover:border-gray-200 transition-all">
                  <Avatar name={u.name} size="lg" color={ROLE_COLORS[u.role]} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold">{u.name}</h3>
                    <div className="mt-1"><RoleTag role={u.role} /></div>
                    {u.bio && <p className="text-[13px] text-text-secondary leading-relaxed mt-2 line-clamp-3">{u.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {profiles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-text-secondary">No members yet. Be the first to join!</p>
          </div>
        )}
      </div>
    </div>
  );
}
