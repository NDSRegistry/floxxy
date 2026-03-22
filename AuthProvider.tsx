'use client';

import { useEffect, useState } from 'react';
import { getPosts, createPost } from '@/lib/supabase';
import { Avatar, SectionHeader, Modal } from '@/components/UI';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { canManageContent } from '@/lib/types';
import type { Post } from '@/lib/types';

export default function MagazinePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { profile } = useAuth();
  const toast = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Announcement');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPosts().then(p => { setPosts(p); setLoaded(true); });
  }, []);

  async function handleCreate() {
    if (!title.trim() || !content.trim() || !profile) return;
    setSubmitting(true);
    const { data, error } = await createPost(title.trim(), content.trim(), tag, profile.id);
    if (error) {
      toast.show('Failed to publish: ' + error.message, 'error');
    } else {
      toast.show('Post published');
      setPosts(prev => [{ ...data, author: profile } as Post, ...prev]);
      setTitle(''); setContent(''); setTag('Announcement');
      setShowCreate(false);
    }
    setSubmitting(false);
  }

  const canCreate = canManageContent(profile);

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Full post view
  if (selectedPost) {
    const author = selectedPost.author;
    return (
      <div className="animate-in py-12">
        <div className="max-w-[680px] mx-auto px-6">
          <button onClick={() => setSelectedPost(null)} className="text-[13px] text-text-secondary hover:text-text-primary mb-6 flex items-center gap-1">
            ← Back to Magazine
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{selectedPost.tag}</span>
          <h1 className="font-display text-[32px] tracking-tight mt-2">{selectedPost.title}</h1>
          <div className="flex items-center gap-3 mt-4 pb-6 border-b border-border-light">
            {author && <Avatar name={author.name} size="sm" />}
            <span className="text-[14px]">{author?.name}</span>
            <span className="text-[13px] text-text-tertiary">
              {new Date(selectedPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="mt-7 text-[16px] leading-[1.75] text-gray-700 whitespace-pre-line">
            {selectedPost.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in py-12">
      <div className="max-w-[720px] mx-auto px-6">
        <div className="flex justify-between items-start">
          <SectionHeader label="Stories" title="Magazine" subtitle="Updates, project spotlights, and news from the lab." />
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
              New Post
            </button>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="bg-white border border-border rounded-xl mt-7 overflow-hidden">
            {posts.map(post => {
              const author = post.author;
              const tagColors: Record<string, string> = {
                'Announcement': 'text-blue-600',
                'Project Spotlight': 'text-emerald-600',
                'Events': 'text-orange-600',
                'Research': 'text-purple-600',
                'Newsletter': 'text-pink-600',
              };
              return (
                <div
                  key={post.id}
                  className="px-7 py-6 border-b border-border-light last:border-b-0 cursor-pointer hover:bg-[#fafafa] transition-colors"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${tagColors[post.tag] || 'text-text-tertiary'}`}>
                      {post.tag}
                    </span>
                    <span className="text-[12.5px] text-text-tertiary">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-[18px] font-semibold tracking-tight mt-2">{post.title}</h2>
                  <p className="text-[14px] text-text-secondary leading-relaxed mt-1.5 line-clamp-2">{post.content}</p>
                  {author && (
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar name={author.name} size="sm" />
                      <span className="text-[13px] text-text-secondary">{author.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 mt-7 bg-[#fafafa] rounded-xl border border-border-light">
            <p className="text-sm text-text-secondary">No posts published yet.</p>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal
          title="Publish Post"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[13px] font-medium border border-border rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={submitting || !title.trim() || !content.trim()} className="px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                {submitting ? 'Publishing...' : 'Publish'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Tag</label>
              <select value={tag} onChange={e => setTag(e.target.value)} className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 bg-white">
                <option>Announcement</option>
                <option>Project Spotlight</option>
                <option>Events</option>
                <option>Research</option>
                <option>Newsletter</option>
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-1.5">Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Write your post..." className="w-full px-3 py-2.5 text-[14px] border border-border rounded-lg outline-none focus:border-gray-400 resize-y min-h-[120px] leading-relaxed" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
