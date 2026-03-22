'use client';

import { useEffect, useState } from 'react';
import { getCamps, createCamp, registerForCamp, unregisterFromCamp, getUserCampRegistrations } from '@/lib/supabase';
import { SDGTag, StatusBadge, SectionHeader, Modal, SDGPicker } from '@/components/UI';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { canManageContent } from '@/lib/types';
import type { Camp } from '@/lib/types';

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [myRegs, setMyRegs] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { profile } = useAuth();
  const toast = useToast();

  // Form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [location, setLocation] = useState('');
  const [spots, setSpots] = useState(40);
  const [sdgs, setSdgs] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCamps().then(c => { setCamps(c); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (profile) {
      getUserCampRegistrations(profile.id).then(setMyRegs);
    }
  }, [profile]);

  async function handleCreate() {
    if (!title.trim() || !desc.trim() || !dateRange.trim() || !location.trim() || !profile) return;
    setSubmitting(true);
    const { data, error } = await createCamp(title.trim(), desc.trim(), dateRange.trim(), location.trim(), spots, profile.id, sdgs);
    if (error) {
      toast.show('Failed: ' + error.message, 'error');
    } else {
      toast.show('Camp created');
      // Reload
      getCamps().then(setCamps);
      setTitle(''); setDesc(''); setDateRange(''); setLocation(''); setSpots(40); setSdgs([]);
      setShowCreate(false);
    }
    setSubmitting(false);
  }

  async function handleRegister(campId: string) {
    if (!profile) return;
    const camp = camps.find(c => c.id === campId);
    if (!camp || camp.registered_count >= camp.total_spots) return;

    const { error } = await registerForCamp(campId, profile.id);
    if (error) {
      toast.show('Could not register', 'error');
    } else {
      toast.show('Registered!');
      setMyRegs(prev => [...prev, campId]);
      setCamps(prev => prev.map(c => c.id === campId ? { ...c, registered_count: c.registered_count + 1 } : c));
    }
  }

  async function handleUnregister(campId: string) {
    if (!profile) return;
    const { error } = await unregisterFromCamp(campId, profile.id);
    if (error) {
      toast.show('Could not unregister', 'error');
    } else {
      toast.show('Unregistered');
      setMyRegs(prev => prev.filter(id => id !== campId));
      setCamps(prev => prev.map(c => c.id === campId ? { ...c, registered_count: Math.max(0, c.registered_count - 1) } : c));
    }
  }

  const canCreate = canManageContent(profile);

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-in py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <SectionHeader label="Events" title="Labs & Camps" subtitle="Workshops, hackathons, and innovation camps." />
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
              New Camp
            </button>
          )}
        </div>

        {camps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7 stagger">
            {camps.map(camp => {
              const pct = Math.round((camp.registered_count / camp.total_spots) * 100);
              const full = camp.registered_count >= camp.total_spots;
              const registered = myRegs.includes(camp.id);
              return (
                <div key={camp.id} className="bg-white border border-border rounded-xl p-6 hover:shadow-card hover:border-gray-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-text-tertiary text-[13px]">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="3" width="12" height="11" rx="1.5"/><line x1="2" y1="7" x2="14" y2="7"/><line x1="5" y1="1" x2="5" y2="4"/><line x1="11" y1="1" x2="11" y2="4"/></svg>
                      {camp.date_range}
                    </div>
                    <StatusBadge status={full ? 'Full' : 'Open'} />
                  </div>
                  <h3 className="text-[18px] font-semibold tracking-tight mt-3">{camp.title}</h3>
                  <p className="text-[13.5px] text-text-secondary leading-relaxed mt-1.5">{camp.description}</p>
                  {(camp.sdgs || []).length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-3">
                      {(camp.sdgs || []).map(s => <SDGTag key={s.id} sdg={s} small />)}
                    </div>
                  )}
                  <div className="flex justify-between text-[12px] text-text-tertiary mt-4">
                    <span>{camp.location}</span>
                    <span>{camp.registered_count}/{camp.total_spots} registered</span>
                  </div>
                  <div className="h-[3px] bg-border-light rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>

                  {profile && (
                    <div className="mt-4">
                      {registered ? (
                        <button onClick={() => handleUnregister(camp.id)} className="text-[13px] font-medium text-red-600 hover:text-red-700">
                          Unregister
                        </button>
                      ) : !full ? (
                        <button onClick={() => handleRegister(camp.id)} className="text-[13px] font-medium text-accent hover:underline">
                          Register →
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 mt-7 bg-[#fafafa] rounded-xl border border-border-light">
            <p className="text-sm text-text-secondary">No camps scheduled yet.</p>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal
          title="Create Camp"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[13px] font-medium border border-border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !title.trim() || !desc.trim() || !dateRange.trim() || !location.trim()} className="px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Camp title" className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Date Range</label>
              <input value={dateRange} onChange={e => setDateRange(e.target.value)} placeholder="e.g. April 12–14, 2026" className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Cairo Innovation Hub" className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Total Spots</label>
              <input type="number" value={spots} onChange={e => setSpots(Number(e.target.value))} min={1} className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="What's this camp about?" className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 resize-y min-h-[80px]" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">SDGs</label>
              <SDGPicker selected={sdgs} onChange={setSdgs} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
