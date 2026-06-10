'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { defaultFormData } from '@/lib/defaultData';
import { generateReadme } from '@/lib/generateReadme';
import type { FormData, Achievement, Badge, BadgeCategory, Goal } from '@/lib/types';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

type Section =
  | 'profile'
  | 'build'
  | 'achievements'
  | 'techstack'
  | 'projects'
  | 'goals'
  | 'shoutout'
  | 'options';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'build', label: 'What I Build' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'techstack', label: 'Tech Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'goals', label: 'Goals' },
  { id: 'shoutout', label: 'Shoutout' },
  { id: 'options', label: 'Options' },
];

// ── Reusable input primitives ──────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{children}</label>;
}

function Input({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3460]/40 focus:border-[#0F3460] ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3460]/40 focus:border-[#0F3460] resize-y font-mono"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#0F3460]' : 'bg-slate-300'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-slate-800 mb-4">{children}</h2>;
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#0F3460] hover:text-[#0F3460]/70 transition-colors"
    >
      <span className="text-base leading-none">+</span> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
      title="Remove"
    >
      ×
    </button>
  );
}

// ── Section components ─────────────────────────────────────────────────────────

function ProfileSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <SectionTitle>Profile Info</SectionTitle>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <FieldGroup>
          <Label>Name</Label>
          <Input value={form.name} onChange={v => update('name', v)} placeholder="Kayan Shah" />
        </FieldGroup>
        <FieldGroup>
          <Label>Location</Label>
          <Input value={form.location} onChange={v => update('location', v)} placeholder="London" />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <FieldGroup>
          <Label>GitHub Username</Label>
          <Input value={form.githubUsername} onChange={v => update('githubUsername', v)} placeholder="KayanShah" />
        </FieldGroup>
        <FieldGroup>
          <Label>Email</Label>
          <Input value={form.email} onChange={v => update('email', v)} placeholder="hi@example.com" />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>Typing SVG Lines (one per line)</Label>
        <Textarea
          value={form.typingLines}
          onChange={v => update('typingLines', v)}
          placeholder={"Hi there! I'm Kayan 👋\nBuilder. Leader. Engineer.\nWelcome to my GitHub!"}
          rows={4}
        />
        <p className="text-xs text-slate-400 mt-1">Each line scrolls one after another in your typing SVG header.</p>
      </FieldGroup>
      <FieldGroup>
        <Label>Tagline (blockquote)</Label>
        <Input
          value={form.tagline}
          onChange={v => update('tagline', v)}
          placeholder="Founder. Team Leader. Engineer."
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Bio Paragraph (markdown supported)</Label>
        <Textarea
          value={form.bio}
          onChange={v => update('bio', v)}
          placeholder="I'm **Your Name** — a student engineer based in..."
          rows={5}
        />
      </FieldGroup>
    </div>
  );
}

function BuildSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <SectionTitle>What I Build</SectionTitle>
      <p className="text-xs text-slate-500 mb-4">These appear as a 2-column table under the GitHub Stats section.</p>
      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <p className="text-xs font-bold text-[#0F3460] mb-2 uppercase tracking-wide">Left Column</p>
        <FieldGroup>
          <Label>Title</Label>
          <Input value={form.whatIBuildLeftTitle} onChange={v => update('whatIBuildLeftTitle', v)} placeholder="AI & Software" />
        </FieldGroup>
        <FieldGroup>
          <Label>Description</Label>
          <Textarea
            value={form.whatIBuildLeftDesc}
            onChange={v => update('whatIBuildLeftDesc', v)}
            placeholder="Python, Swift/SwiftUI, and LLMs..."
            rows={2}
          />
        </FieldGroup>
      </div>
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs font-bold text-[#0F3460] mb-2 uppercase tracking-wide">Right Column</p>
        <FieldGroup>
          <Label>Title</Label>
          <Input value={form.whatIBuildRightTitle} onChange={v => update('whatIBuildRightTitle', v)} placeholder="Engineering & Robotics" />
        </FieldGroup>
        <FieldGroup>
          <Label>Description</Label>
          <Textarea
            value={form.whatIBuildRightDesc}
            onChange={v => update('whatIBuildRightDesc', v)}
            placeholder="Full-scale electric cars to VEX competition robots..."
            rows={2}
          />
        </FieldGroup>
      </div>
    </div>
  );
}

function AchievementsSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  function addRow() {
    update('achievements', [...form.achievements, { id: uid(), emoji: '🏆', title: '', scope: '' }]);
  }

  function removeRow(id: string) {
    update('achievements', form.achievements.filter(a => a.id !== id));
  }

  function updateRow(id: string, field: keyof Achievement, value: string) {
    update(
      'achievements',
      form.achievements.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  }

  return (
    <div>
      <SectionTitle>Honours & Achievements</SectionTitle>
      <p className="text-xs text-slate-500 mb-4">Title supports markdown (bold, links, etc).</p>
      <div className="space-y-3">
        {form.achievements.map((a, i) => (
          <div key={a.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
              <div className="flex-1" />
              <RemoveButton onClick={() => removeRow(a.id)} />
            </div>
            <div className="grid grid-cols-[64px_1fr_140px] gap-2">
              <div>
                <Label>Emoji</Label>
                <Input value={a.emoji} onChange={v => updateRow(a.id, 'emoji', v)} placeholder="🏆" />
              </div>
              <div>
                <Label>Achievement (markdown)</Label>
                <Input value={a.title} onChange={v => updateRow(a.id, 'title', v)} placeholder="**Title** — description" />
              </div>
              <div>
                <Label>Scope</Label>
                <Input value={a.scope} onChange={v => updateRow(a.id, 'scope', v)} placeholder="🌍 Global" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <AddButton onClick={addRow} label="Add achievement" />
    </div>
  );
}

function BadgeChip({
  badge,
  onRemove,
}: {
  badge: Badge;
  onRemove: () => void;
}) {
  const color = badge.color.replace('#', '');
  const previewUrl = `https://img.shields.io/badge/${badge.label.replace(/ /g, '_').replace(/-/g, '--')}-${color}?style=flat-square${badge.logo ? `&logo=${badge.logo}` : ''}${badge.logoColor ? `&logoColor=${badge.logoColor}` : ''}`;

  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt={badge.label} className="h-4 max-w-[120px] object-contain" />
      <button
        onClick={onRemove}
        className="text-slate-300 hover:text-red-400 transition-colors leading-none opacity-0 group-hover:opacity-100 ml-0.5"
      >
        ×
      </button>
    </div>
  );
}

function TechStackSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const [newBadge, setNewBadge] = useState<Record<string, { label: string; color: string; logo: string; logoColor: string }>>({});
  const [expandedCat, setExpandedCat] = useState<string | null>(form.badgeCategories[0]?.id ?? null);

  function addCategory() {
    const id = uid();
    update('badgeCategories', [...form.badgeCategories, { id, name: 'New Category', badges: [] }]);
    setExpandedCat(id);
  }

  function removeCategory(id: string) {
    update('badgeCategories', form.badgeCategories.filter(c => c.id !== id));
  }

  function updateCategoryName(id: string, name: string) {
    update(
      'badgeCategories',
      form.badgeCategories.map(c => (c.id === id ? { ...c, name } : c))
    );
  }

  function removeBadge(catId: string, badgeId: string) {
    update(
      'badgeCategories',
      form.badgeCategories.map(c =>
        c.id === catId ? { ...c, badges: c.badges.filter(b => b.id !== badgeId) } : c
      )
    );
  }

  function addBadge(catId: string) {
    const nb = newBadge[catId];
    if (!nb?.label?.trim()) return;
    const badge: Badge = {
      id: uid(),
      label: nb.label.trim(),
      color: nb.color.replace('#', '') || '555555',
      logo: nb.logo.trim(),
      logoColor: nb.logoColor.trim() || 'white',
    };
    update(
      'badgeCategories',
      form.badgeCategories.map(c =>
        c.id === catId ? { ...c, badges: [...c.badges, badge] } : c
      )
    );
    setNewBadge(prev => ({ ...prev, [catId]: { label: '', color: '#555555', logo: '', logoColor: 'white' } }));
  }

  function getNb(catId: string) {
    return newBadge[catId] ?? { label: '', color: '#555555', logo: '', logoColor: 'white' };
  }

  function setNb(catId: string, field: string, val: string) {
    setNewBadge(prev => ({
      ...prev,
      [catId]: { ...(prev[catId] ?? { label: '', color: '#555555', logo: '', logoColor: 'white' }), [field]: val },
    }));
  }

  return (
    <div>
      <SectionTitle>Tech Stack</SectionTitle>
      <div className="space-y-2">
        {form.badgeCategories.map(cat => (
          <div key={cat.id} className="border border-slate-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 cursor-pointer"
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
            >
              <span className="text-sm font-semibold text-slate-700 flex-1">{cat.name}</span>
              <span className="text-xs text-slate-400">{cat.badges.length} badges</span>
              <span className="text-slate-400">{expandedCat === cat.id ? '▲' : '▼'}</span>
              <button
                onClick={e => { e.stopPropagation(); removeCategory(cat.id); }}
                className="text-slate-300 hover:text-red-400 transition-colors text-base leading-none"
              >
                ×
              </button>
            </div>

            {expandedCat === cat.id && (
              <div className="p-3">
                <FieldGroup>
                  <Label>Category Name</Label>
                  <Input
                    value={cat.name}
                    onChange={v => updateCategoryName(cat.id, v)}
                    placeholder="Languages"
                  />
                </FieldGroup>

                <div className="flex flex-wrap gap-2 mb-3">
                  {cat.badges.map(b => (
                    <BadgeChip
                      key={b.id}
                      badge={b}
                      onRemove={() => removeBadge(cat.id, b.id)}
                    />
                  ))}
                  {cat.badges.length === 0 && (
                    <p className="text-xs text-slate-400">No badges yet. Add one below.</p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Add Badge</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={getNb(cat.id).label}
                        onChange={v => setNb(cat.id, 'label', v)}
                        placeholder="Python"
                      />
                    </div>
                    <div>
                      <Label>Color (hex)</Label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={getNb(cat.id).color.startsWith('#') ? getNb(cat.id).color : `#${getNb(cat.id).color}`}
                          onChange={e => setNb(cat.id, 'color', e.target.value)}
                          className="w-8 h-[30px] rounded border border-slate-200 cursor-pointer"
                        />
                        <Input
                          value={getNb(cat.id).color}
                          onChange={v => setNb(cat.id, 'color', v)}
                          placeholder="3670A0"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <Label>Logo (Simple Icons name)</Label>
                      <Input
                        value={getNb(cat.id).logo}
                        onChange={v => setNb(cat.id, 'logo', v)}
                        placeholder="python"
                      />
                    </div>
                    <div>
                      <Label>Logo Color</Label>
                      <Input
                        value={getNb(cat.id).logoColor}
                        onChange={v => setNb(cat.id, 'logoColor', v)}
                        placeholder="white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => addBadge(cat.id)}
                    className="w-full py-1.5 bg-[#0F3460] text-white text-xs font-semibold rounded-md hover:bg-[#0F3460]/90 transition-colors"
                  >
                    Add Badge
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <AddButton onClick={addCategory} label="Add category" />
    </div>
  );
}

function ProjectsSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const repos = [...form.featuredRepos];
  while (repos.length < 4) repos.push('');

  function updateRepo(index: number, value: string) {
    const next = [...repos];
    next[index] = value;
    update('featuredRepos', next);
  }

  return (
    <div>
      <SectionTitle>Featured Projects</SectionTitle>
      <p className="text-xs text-slate-500 mb-4">
        Up to 4 repos from your GitHub. Leave blank to skip. Cards are shown 2 per row.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {repos.slice(0, 4).map((repo, i) => (
          <FieldGroup key={i}>
            <Label>Repo {i + 1}</Label>
            <Input
              value={repo}
              onChange={v => updateRepo(i, v)}
              placeholder={`your-repo-name`}
            />
          </FieldGroup>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Uses <code className="bg-slate-100 px-1 rounded">kayan-github-profile-projects-featu.vercel.app</code>
      </p>
    </div>
  );
}

function GoalsSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  function addGoal() {
    update('goals', [...form.goals, { id: uid(), text: '', completed: false, note: '' }]);
  }

  function removeGoal(id: string) {
    update('goals', form.goals.filter(g => g.id !== id));
  }

  function updateGoal(id: string, field: keyof Goal, value: string | boolean) {
    update(
      'goals',
      form.goals.map(g => (g.id === id ? { ...g, [field]: value } : g))
    );
  }

  return (
    <div>
      <SectionTitle>Goals</SectionTitle>
      <FieldGroup>
        <Label>Year</Label>
        <Input value={form.goalsYear} onChange={v => update('goalsYear', v)} placeholder="2026" className="w-24" />
      </FieldGroup>
      <div className="space-y-3">
        {form.goals.map((g, i) => (
          <div key={g.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={g.completed}
                onChange={e => updateGoal(g.id, 'completed', e.target.checked)}
                className="w-4 h-4 accent-[#0F3460]"
              />
              <span className="text-xs text-slate-400">#{i + 1} {g.completed ? '(completed)' : ''}</span>
              <div className="flex-1" />
              <RemoveButton onClick={() => removeGoal(g.id)} />
            </div>
            <FieldGroup>
              <Label>Goal text (markdown supported)</Label>
              <Input value={g.text} onChange={v => updateGoal(g.id, 'text', v)} placeholder="Reach **1,000 GitHub followers**" />
            </FieldGroup>
            {g.completed && (
              <FieldGroup>
                <Label>Completion note (shown in italics)</Label>
                <Input value={g.note} onChange={v => updateGoal(g.id, 'note', v)} placeholder="Won the Judges Award at VEX Worlds 2026" />
              </FieldGroup>
            )}
          </div>
        ))}
      </div>
      <AddButton onClick={addGoal} label="Add goal" />
    </div>
  );
}

function ShoutoutSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <SectionTitle>Shoutout</SectionTitle>
      <FieldGroup>
        <Label>GitHub Username (without @)</Label>
        <Input
          value={form.shoutoutUsername}
          onChange={v => update('shoutoutUsername', v)}
          placeholder="PanshulVempalli"
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Message</Label>
        <Textarea
          value={form.shoutoutMessage}
          onChange={v => update('shoutoutMessage', v)}
          placeholder="go check out his profile! I do loads of projects with him!"
          rows={2}
        />
      </FieldGroup>
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 font-mono">
        🤝 Shoutout to [<span className="text-[#0F3460]">**@{form.shoutoutUsername || 'username'}**</span>](...) — {form.shoutoutMessage || 'message'}
      </div>
    </div>
  );
}

function OptionsSection({
  form,
  update,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div>
      <SectionTitle>Display Options</SectionTitle>
      <div className="space-y-3">
        <Toggle checked={form.showOpenToCollab} onChange={v => update('showOpenToCollab', v)} label="Show Open to Collaborations badge" />
        <Toggle checked={form.showTrophies} onChange={v => update('showTrophies', v)} label="Show GitHub trophies" />
        <Toggle checked={form.showChart} onChange={v => update('showChart', v)} label="Show GitHub contribution chart" />
        <Toggle checked={form.showTools} onChange={v => update('showTools', v)} label="Show collapsible tools section" />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ReadmeGenerator() {
  const [form, setForm] = useState<FormData>(defaultFormData);
  const [section, setSection] = useState<Section>('profile');
  const [previewMode, setPreviewMode] = useState<'raw' | 'rendered'>('raw');
  const [copied, setCopied] = useState(false);

  const readme = useMemo(() => generateReadme(form), [form]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([readme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (confirm('Reset all fields to default values?')) {
      setForm(defaultFormData);
    }
  }

  const sectionProps = { form, update } as const;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#0F3460] shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center text-white text-sm font-bold">R</div>
          <h1 className="text-white font-bold text-base">GitHub README Generator</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-white/60 hover:text-white text-xs px-3 py-1.5 rounded-md transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 border border-white/40 text-white text-xs px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors font-semibold"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download README.md
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-white text-[#0F3460] text-xs px-3 py-1.5 rounded-md hover:bg-white/90 transition-colors font-bold"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Form ── */}
        <div className="w-[460px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
          {/* Section nav */}
          <nav className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 flex-shrink-0">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex-shrink-0 px-3.5 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  section === s.id
                    ? 'text-[#0F3460] border-[#0F3460] bg-white'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-5">
            {section === 'profile' && <ProfileSection {...sectionProps} />}
            {section === 'build' && <BuildSection {...sectionProps} />}
            {section === 'achievements' && <AchievementsSection {...sectionProps} />}
            {section === 'techstack' && <TechStackSection {...sectionProps} />}
            {section === 'projects' && <ProjectsSection {...sectionProps} />}
            {section === 'goals' && <GoalsSection {...sectionProps} />}
            {section === 'shoutout' && <ShoutoutSection {...sectionProps} />}
            {section === 'options' && <OptionsSection {...sectionProps} />}
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
              <button
                onClick={() => setPreviewMode('raw')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  previewMode === 'raw'
                    ? 'bg-[#0F3460] text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Markdown
              </button>
              <button
                onClick={() => setPreviewMode('rendered')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  previewMode === 'rendered'
                    ? 'bg-[#0F3460] text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Preview
              </button>
            </div>
            <span className="text-xs text-slate-400 ml-auto">
              {readme.length.toLocaleString()} chars · {readme.split('\n').length} lines
            </span>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-y-auto">
            {previewMode === 'raw' ? (
              <div className="h-full bg-[#0d1117]">
                <pre className="p-5 font-mono text-xs text-[#c9d1d9] whitespace-pre-wrap leading-relaxed min-h-full">
                  {readme}
                </pre>
              </div>
            ) : (
              <div className="p-6 bg-white min-h-full">
                <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
                  Stats cards and badges load from external URLs — they will appear on GitHub but may not load here.
                </div>
                <div className="prose prose-sm max-w-none prose-img:inline prose-img:m-0 prose-p:my-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {readme}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
