import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EnhancedEmailBuilder from '../../components/dragDrop/EnhancedEmailBuilder';
import { useTemplateStore } from '../../store/templateStore';
import { uploadAPI } from '../../api/upload.api';
import { Save, Eye, EyeOff, ArrowLeft, FileText, Copy, Check, Code, X, CheckCircle2 } from 'lucide-react';

/* ─── Toast ──────────────────────────────────────────────── */
const Toast = ({ toasts }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto
        ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
        {t.type === 'error' ? <X className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        {t.message}
      </div>
    ))}
  </div>
);

/* ─── HTML Code Modal ────────────────────────────────────── */
const HtmlModal = ({ html, onClose }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Code className="w-4 h-4" />Template HTML</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto p-4 flex-1 relative">
          <button
            onClick={handleCopy}
            className={`absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors z-10
              ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
          </button>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs leading-relaxed min-h-32">
            <code>{html}</code>
          </pre>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end gap-3">
          <button onClick={handleCopy} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors
            ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy HTML</>}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, fetchTemplates, createTemplate, updateTemplate } = useTemplateStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStage, setSaveStage] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [template, setTemplate] = useState({ name: '', subject: '', schema: { blocks: [] } });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    const loadTemplate = async () => {
      await fetchTemplates();
      setLoading(false);
    };
    loadTemplate();
  }, []);

  useEffect(() => {
    if (id !== 'new' && templates.length > 0) {
      const existing = templates.find(t => t.id.toString() === id);
      if (existing) setTemplate(existing);
    }
  }, [id, templates]);

  /* ── Image upload helper ── */
  const prepareBlocks = async (blocks, templateID) => {
    return Promise.all(blocks.map(async (block) => {
      let updated = { ...block };
      if (block.type === 'image' && typeof block.content === 'string' && block.content.startsWith('data:')) {
        try {
          const { key, imageUrl } = await uploadAPI.uploadDataUrlAsImage(block.content, `img-${block.id}.jpg`, templateID);
          updated = { ...updated, content: imageUrl || block.content, imageKey: key || null };
        } catch {}
      }
      if (Array.isArray(block.children) && block.children.length > 0) {
        updated = { ...updated, children: await prepareBlocks(block.children, templateID) };
      }
      return updated;
    }));
  };

  /* ── HTML generator ── */
  const generateHTMLFromBlocks = useCallback((blocks) => {
    const renderBlock = (block) => {
      if (block.type === 'text') return `  <div style="margin-bottom:16px;">${block.content}</div>\n`;
      if (block.type === 'image') {
        const align = block.align === 'justify-start' ? 'left' : block.align === 'justify-end' ? 'right' : 'center';
        return `  <div style="text-align:${align};margin-bottom:16px;">\n    <img src="${block.content}" alt="${block.alt || 'Image'}" style="width:${block.width || 'auto'};max-width:100%;border-radius:8px;"/>\n  </div>\n`;
      }
      if (block.type === 'button') {
        const align = block.align === 'justify-start' ? 'left' : block.align === 'justify-end' ? 'right' : 'center';
        return `  <div style="text-align:${align};margin-bottom:16px;">\n    <a href="${block.link || '#'}" style="background-color:${block.bgColor || '#3b82f6'};color:${block.textColor || '#fff'};padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">${block.content || 'Button'}</a>\n  </div>\n`;
      }
      if (block.type === 'divider') return `  <hr style="border:0;border-top:1px solid ${block.color || '#e5e7eb'};margin:24px 0;"/>\n`;
      if (block.type === 'spacer') return `  <div style="height:${block.height || 20}px;"></div>\n`;
      if (block.children?.length) return block.children.map(renderBlock).join('');
      return '';
    };
    let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1.0">\n  <title>${template.subject || 'Email Template'}</title>\n  <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;}img{max-width:100%;height:auto;}a{color:#3b82f6;text-decoration:none;}</style>\n</head>\n<body>\n`;
    blocks.forEach(b => { html += renderBlock(b); });
    html += `</body>\n</html>`;
    return html;
  }, [template.subject]);

  const generateHTML = () => generateHTMLFromBlocks(template.schema.blocks || []);

  /* ── Save ── */
  const handleSave = async () => {
    if (!template.name.trim()) { addToast('Please enter a template name.', 'error'); return; }
    setSaving(true);
    setSaveStage('Uploading images…');
    try {
      const templateID = id !== 'new' ? id : undefined;
      const resolvedBlocks = await prepareBlocks(template.schema.blocks || [], templateID);
      setSaveStage('Uploading HTML…');
      const htmlString = generateHTMLFromBlocks(resolvedBlocks);
      let htmlKey = template.htmlKey || null;
      try {
        const htmlRes = await uploadAPI.uploadHtmlString(htmlString, templateID);
        htmlKey = htmlRes.key || htmlKey;
      } catch {}
      setSaveStage('Saving…');
      const payload = { ...template, schema: { blocks: resolvedBlocks }, htmlKey };
      if (id === 'new') {
        const result = await createTemplate(payload);
        if (result.success) navigate('/dashboard/templates');
      } else {
        await updateTemplate(id, payload);
        addToast('Template saved successfully.');
      }
    } catch (err) {
      addToast('Failed to save template. Please try again.', 'error');
    } finally {
      setSaving(false);
      setSaveStage('');
    }
  };

  const handleBlocksChange = useCallback((blocks) => {
    setTemplate(prev => ({ ...prev, schema: { blocks } }));
  }, []);

  /* ── Preview renderer ── */
  const renderPreview = () => {
    const renderBlock = (block) => {
      if (block.type === 'text') return <div key={block.id} className="mb-4" dangerouslySetInnerHTML={{ __html: block.content }} />;
      if (block.type === 'image') return (
        <div key={block.id} className={`mb-4 ${block.align || 'text-center'}`}>
          <div className={`inline-block ${block.textWrap ? 'float-' + block.textWrap + ' mr-4' : ''}`} style={{ maxWidth: block.width || '100%' }}>
            <img src={block.content} alt={block.alt || 'Image'} style={{ width: '100%', maxWidth: block.width || '100%' }} className="rounded" />
            {block.caption && <p className="text-sm text-slate-600 mt-2 italic">{block.caption}</p>}
          </div>
        </div>
      );
      if (block.type === 'button') return (
        <div key={block.id} className={`mb-4 flex ${block.align || 'justify-center'}`}>
          <a href={block.link || '#'} style={{ backgroundColor: block.bgColor || '#3b82f6', color: block.textColor || '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', fontWeight: 600 }}>
            {block.content || 'Button'}
          </a>
        </div>
      );
      if (block.type === 'divider') return <hr key={block.id} style={{ borderColor: block.color || '#e5e7eb', margin: '24px 0' }} />;
      if (block.type === 'spacer') return <div key={block.id} style={{ height: `${block.height || 20}px` }} />;
      if (block.type === 'social') return (
        <div key={block.id} className={`flex gap-3 mb-4 ${block.align || 'justify-center'}`}>
          {block.icons?.includes('facebook') && <a href={block.facebookUrl || '#'} className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white text-xs font-bold">f</a>}
          {block.icons?.includes('twitter') && <a href={block.twitterUrl || '#'} className="w-9 h-9 rounded-full bg-[#1da1f2] flex items-center justify-center text-white text-xs font-bold">t</a>}
          {block.icons?.includes('instagram') && <a href={block.instagramUrl || '#'} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white text-xs font-bold">in</a>}
          {block.icons?.includes('linkedin') && <a href={block.linkedinUrl || '#'} className="w-9 h-9 rounded-full bg-[#0077b5] flex items-center justify-center text-white text-xs font-bold">li</a>}
          {block.icons?.includes('youtube') && <a href={block.youtubeUrl || '#'} className="w-9 h-9 rounded-full bg-[#ff0000] flex items-center justify-center text-white text-xs font-bold">yt</a>}
        </div>
      );
      if (block.type === 'columns') {
        const colCount = block.columnCount || 2;
        const cols = Array.from({ length: colCount }, () => []);
        (block.children || []).forEach((child, idx) => cols[idx % colCount].push(child));
        return (
          <div key={block.id} className="mb-4 rounded" style={{ backgroundColor: block.bgColor === 'none' ? 'transparent' : (block.bgColor || '#fff'), padding: `${block.paddingTop||0}px ${block.paddingRight||0}px ${block.paddingBottom||0}px ${block.paddingLeft||0}px`, display: 'grid', gridTemplateColumns: `repeat(${colCount},1fr)`, gap: `${block.columnGap||16}px` }}>
            {cols.map((col, ci) => <div key={ci} className="flex flex-col">{col.length ? col.map(renderBlock) : <p className="text-slate-400 text-sm italic text-center py-2">Column {ci+1}</p>}</div>)}
          </div>
        );
      }
      if (block.type === 'container') return (
        <div key={block.id} className="rounded mb-4" style={{ backgroundColor: block.bgColor || 'transparent', paddingTop: `${block.paddingTop||20}px`, paddingBottom: `${block.paddingBottom||20}px`, paddingLeft: `${block.paddingLeft||20}px`, paddingRight: `${block.paddingRight||20}px`, marginTop: `${block.marginTop||0}px`, marginBottom: `${block.marginBottom||0}px` }}>
          {block.children?.length ? block.children.map(renderBlock) : <div dangerouslySetInnerHTML={{ __html: block.content || '' }} />}
        </div>
      );
      if (block.type === 'section') return (
        <div key={block.id} className="rounded mb-6 p-6" style={{ backgroundColor: block.bgColor || '#fff' }}>
          {block.children?.length ? block.children.map(renderBlock) : <div className="text-slate-400 text-center py-4">Empty section</div>}
        </div>
      );
      return null;
    };
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
          <span className="text-xs text-slate-500 ml-2 font-mono truncate">{template.subject || 'Email Preview'}</span>
        </div>
        <div className="p-6">
          <div className="max-w-lg mx-auto bg-white">
            {template.subject && <h2 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">{template.subject}</h2>}
            {(template.schema?.blocks || []).map(renderBlock)}
            {!(template.schema?.blocks?.length) && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                <FileText className="w-12 h-12 mb-3" />
                <p className="text-sm">Add blocks to see your email preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading…">
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading template…</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={id === 'new' ? 'Create Template' : `Edit Template`}>
      <Toast toasts={toasts} />
      {showHtmlModal && <HtmlModal html={generateHTML()} onClose={() => setShowHtmlModal(false)} />}

      {/* Sticky Top Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 mb-6 sticky top-4 z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Back */}
          <button
            onClick={() => navigate('/dashboard/templates')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-5 bg-slate-200 shrink-0" />

          {/* Name input */}
          <input
            type="text"
            placeholder="Template name…"
            value={template.name}
            onChange={e => setTemplate({ ...template, name: e.target.value })}
            className="flex-1 min-w-36 px-3 py-2 text-sm font-semibold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:font-normal placeholder:text-slate-400"
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowHtmlModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Code className="w-4 h-4" /> View Code
            </button>
            <button
              onClick={() => setShowPreview(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors
                ${showPreview ? 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white shadow-sm transition-colors"
            >
              {saving
                ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{saveStage || 'Saving…'}</>
                : <><Save className="w-4 h-4" />Save Template</>
              }
            </button>
          </div>
        </div>

        {/* Subject row */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Email subject line…"
            value={template.subject}
            onChange={e => setTemplate({ ...template, subject: e.target.value })}
            className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Split View */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-slate-700">Editor</h2>
          </div>
          <EnhancedEmailBuilder
            initialBlocks={template.schema.blocks}
            onChange={handleBlocksChange}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Eye className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm font-semibold text-slate-700">Live Preview</h2>
            </div>
            <div className="sticky top-32">
              {renderPreview()}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TemplateEditor;
