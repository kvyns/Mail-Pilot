import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useTemplateStore } from '../../store/templateStore';
import { FileText, Plus, Eye, Edit, Copy, Trash2, Search, X, LayoutTemplate, AlignLeft, CheckCircle2 } from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────── */
const countBlocks = (blocks = []) => {
  let n = 0;
  const walk = (list) => { list.forEach(b => { n++; if (b.children?.length) walk(b.children); }); };
  walk(blocks);
  return n;
};

const renderEmail = (blocks = []) => {
  const renderBlock = (block) => {
    if (block.type === 'text') {
      return <div key={block.id} dangerouslySetInnerHTML={{ __html: block.content }} className="mb-3" />;
    } else if (block.type === 'image') {
      return (
        <div key={block.id} className={`mb-3 ${block.align || 'text-center'}`}>
          <img src={block.content} alt={block.alt || ''} style={{ maxWidth: block.width || '100%' }} className="rounded" />
          {block.caption && <p className="text-xs text-slate-500 mt-1 italic">{block.caption}</p>}
        </div>
      );
    } else if (block.type === 'button') {
      return (
        <div key={block.id} className={`mb-3 flex ${block.align || 'justify-center'}`}>
          <span style={{ backgroundColor: block.bgColor || '#3b82f6', color: block.textColor || '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, display: 'inline-block' }}>
            {block.content || 'Button'}
          </span>
        </div>
      );
    } else if (block.type === 'divider') {
      return <hr key={block.id} className="my-3" style={{ borderColor: block.color || '#e5e7eb' }} />;
    } else if (block.type === 'spacer') {
      return <div key={block.id} style={{ height: `${block.height || 20}px` }} />;
    } else if (block.type === 'container' || block.type === 'section') {
      return (
        <div key={block.id} className="rounded mb-3"
          style={{ backgroundColor: block.bgColor || 'transparent', padding: `${block.paddingTop||16}px ${block.paddingRight||16}px ${block.paddingBottom||16}px ${block.paddingLeft||16}px` }}>
          {block.children?.length ? block.children.map(renderBlock) : <div dangerouslySetInnerHTML={{ __html: block.content || '' }} />}
        </div>
      );
    } else if (block.type === 'columns') {
      const colCount = block.columnCount || 2;
      const cols = Array.from({ length: colCount }, () => []);
      (block.children || []).forEach((child, i) => cols[i % colCount].push(child));
      return (
        <div key={block.id} className="mb-3" style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount},1fr)`, gap: 12 }}>
          {cols.map((col, ci) => <div key={ci}>{col.map(renderBlock)}</div>)}
        </div>
      );
    }
    return null;
  };
  return blocks.map(renderBlock);
};

/* ─── Toast ──────────────────────────────────────────────── */
const Toast = ({ toasts }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto transition-all
        ${t.type === 'error' ? 'bg-red-500' : t.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
        {t.type === 'error' ? <X className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        {t.message}
      </div>
    ))}
  </div>
);

/* ─── Confirm Modal ──────────────────────────────────────── */
const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Preview Modal ──────────────────────────────────────── */
const PreviewModal = ({ template, onClose }) => {
  if (!template) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">{template.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{template.subject}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg mx-auto shadow-sm">
            {template.subject && <h2 className="text-xl font-bold text-slate-900 mb-4">{template.subject}</h2>}
            {(template.schema?.blocks?.length || 0) > 0
              ? renderEmail(template.schema.blocks)
              : <div className="text-center py-8 text-slate-400 text-sm">This template has no content blocks yet.</div>}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const Templates = () => {
  const navigate = useNavigate();
  const { templates, isLoading, fetchTemplates, deleteTemplate, duplicateTemplate } = useTemplateStore();

  const [search, setSearch] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // template obj
  const [toasts, setToasts] = useState([]);

  useEffect(() => { fetchTemplates(); }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const filtered = templates.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Stats ── */
  const totalBlocks = templates.reduce((sum, t) => sum + countBlocks(t.schema?.blocks), 0);
  const avgBlocks = templates.length ? Math.round(totalBlocks / templates.length) : 0;
  const withSubject = templates.filter(t => t.subject?.trim()).length;
  const withContent = templates.filter(t => (t.schema?.blocks?.length || 0) > 0).length;

  const stats = [
    { label: 'Total Templates', value: templates.length, icon: LayoutTemplate, color: 'text-primary-600 bg-primary-50' },
    { label: 'With Content', value: withContent, icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'With Subject', value: withSubject, icon: AlignLeft, color: 'text-violet-600 bg-violet-50' },
    { label: 'Avg Block Count', value: avgBlocks, icon: Copy, color: 'text-amber-600 bg-amber-50' },
  ];

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteTemplate(confirmDelete.id);
    addToast(`"${confirmDelete.name}" deleted.`, 'success');
    setConfirmDelete(null);
  };

  const handleDuplicate = async (template) => {
    await duplicateTemplate(template.id);
    addToast(`"${template.name}" duplicated.`, 'success');
  };

  return (
    <DashboardLayout title="Templates">
      <Toast toasts={toasts} />
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{templates.length} template{templates.length !== 1 ? 's' : ''} created</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/templates/create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading templates…</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <LayoutTemplate className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold mb-1">{search ? 'No templates match your search' : 'No templates yet'}</h3>
            <p className="text-sm text-slate-500 mb-6">{search ? 'Try a different keyword.' : 'Create your first email template to get started.'}</p>
            {!search && (
              <button
                onClick={() => navigate('/dashboard/templates/create')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(template => {
              const blockCount = countBlocks(template.schema?.blocks);
              return (
                <div key={template.id} className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary-200 transition-all">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {blockCount > 0 ? (
                      <div className="w-full h-full p-3 overflow-hidden pointer-events-none" style={{ fontSize: '30%', lineHeight: 1.2 }}>
                        <div className="bg-white rounded shadow-sm p-2 h-full overflow-hidden">
                          {renderEmail((template.schema?.blocks || []).slice(0, 4))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <FileText className="w-10 h-10" />
                        <span className="text-xs">No content</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        title="Preview"
                        className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-primary-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate">{template.name}</h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{template.subject || <span className="italic text-slate-400">No subject</span>}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        <FileText className="w-3 h-3" />{blockCount} block{blockCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/templates/${template.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      title="Duplicate"
                      className="p-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(template)}
                      title="Delete"
                      className="p-2 rounded-xl text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Templates;
