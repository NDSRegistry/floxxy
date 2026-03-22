'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProjects, createProject, updateProfile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { Avatar, RoleTag, ProjectCard, Modal, SDGPicker, StatusBadge } from '@/components/UI';
import { canAdmin, canManageContent } from '@/lib/types';
import type { Project } from '@/lib/types';

export default function ProfilePage() {
  const { profile, loading, refresh } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEditBio, setShowEditBio] = useState(false);

  // Project form
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pSdgs, setPSdgs] = useState<number[]>([]);
  const [pStatus, setPStatus] = useState('In Development');
  const [submitting, setSubmitting] = useState(false);

  // Bio form
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/auth');
    }
  }, [loading, profile]);

  useEffect(() => {
    if (profile) {
      getProjects().then(p => {
        setProjects(p.filter(x => x.creator_id === profile.id));
        setLoaded(true);
      });
      setBio(profile.bio || '');
    }
  }, [profile]);

  async function handleCreateProject() {
    if (!pTitle.trim() || !pDesc.trim() || !profile) return;
    setSubmitting(true);
    const { data, error } = await createProject(pTitle.trim(), pDesc.trim(), profile.id, pSdgs, pStatus);
    if (error) {
      toast.show('Failed: ' + error.message, 'error');
    } else {
      toast.show('Project created');
      // Reload projects
      getProjects().then(p => setProjects(p.filter(x => x.creator_id === profile.id)));
      setPTitle(''); setPDesc(''); setPSdgs([]); setPStatus('In Development');
      setShowCreate(false);
    }
    setSubmitting(false);
  }

  async function handleUpdateBio() {
    if (!profile) return;
    const { error } = await updateProfile(profile.id, { bio: bio.trim() });
    if (error) {
      toast.show('Failed to update bio', 'error');
    } else {
      toast.show('Bio updated');
      await refresh();
      setShowEditBio(false);
    }
  }

  if (loading || !profile) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-in py-12">
      <div className="max-w-[800px] mx-auto px-6">
        {/* Profile header */}
        <div className="flex gap-6 items-start flex-col sm:flex-row">
          <Avatar name={profile.name} size="xl" />
          <div className="flex-1">
            <h2 className="text-[22px] font-semibold tracking-tight">{profile.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <RoleTag role={profile.role} />
              {profile.is_admin && <StatusBadge status="Admin" />}
            </div>
            <p className="text-[14px] text-text-secondary leading-relaxed mt-2.5 max-w-md">
              {profile.bio || 'No bio yet.'}
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowEditBio(true)} className="px-3 py-1.5 text-[12.5px] font-medium border border-border rounded-lg hover:bg-gray-50 transition-colors">
                Edit Bio
              </button>
              {canAdmin(profile) && (
                <Link href="/admin" className="px-3 py-1.5 text-[12.5px] font-medium border border-border rounded-lg hover:bg-gray-50 transition-colors no-underline text-text-primary">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="border-t border-border pt-7 mt-8">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[17px] font-semibold">Your Projects</h3>
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
              New Project
            </button>
          </div>

          {!loaded ? (
            <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#fafafa] rounded-xl border border-border-light">
              <svg className="mx-auto text-text-tertiary mb-3" width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="8" cy="8" r="6"/><ellipse cx="8" cy="8" rx="3" ry="6"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
              <p className="text-sm text-text-secondary">No projects yet. Create your first one!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create project modal */}
      {showCreate && (
        <Modal
          title="Create Project"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[13px] font-medium border border-border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateProject} disabled={submitting || !pTitle.trim() || !pDesc.trim()} className="px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Title</label>
              <input value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="Project name" className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Status</label>
              <select value={pStatus} onChange={e => setPStatus(e.target.value)} className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 bg-white">
                <option>In Development</option>
                <option>Active</option>
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Description</label>
              <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} rows={5} placeholder="What does this project do?" className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 resize-y min-h-[100px] leading-relaxed" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">SDGs</label>
              <SDGPicker selected={pSdgs} onChange={setPSdgs} />
            </div>
          </div>
        </Modal>
      )}

      {/* Edit bio modal */}
      {showEditBio && (
        <Modal
          title="Edit Bio"
          onClose={() => setShowEditBio(false)}
          footer={
            <>
              <button onClick={() => setShowEditBio(false)} className="px-4 py-2 text-[13px] font-medium border border-border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdateBio} className="px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90">Save</button>
            </>
          }
        >
          <div>
            <label className="block text-[12.5px] font-medium mb-1.5">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell us about yourself..." className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 resize-y" />
          </div>
        </Modal>
      )}
    </div>
  );
}
