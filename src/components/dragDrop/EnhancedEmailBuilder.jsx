import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  MeasuringStrategy
} from '@dnd-kit/core';
import { useSortable, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { 
  GripVertical, 
  Type, 
  Image as ImageIcon, 
  MousePointer, 
  Minus, 
  Space,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Palette,
  Columns as ColumnsIcon,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Undo2,
  Redo2,
  Eye,
  Layers,
  Copy,
  Check,
  Download,
  Square,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Upload,
  Loader
} from 'lucide-react';
import { uploadAPI } from '../../api';

// ============================================
// CORE DATA MODEL & TYPES
// ============================================

const BlockTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  SOCIAL: 'social',
  COLUMNS: 'columns',
  CONTAINER: 'container',
  SECTION: 'section'
};

// Block capabilities - defines what can be nested where
const BlockCapabilities = {
  [BlockTypes.TEXT]: { canHaveChildren: false, canBeNestedIn: ['section', 'container', 'columns'] },
  [BlockTypes.IMAGE]: { canHaveChildren: false, canBeNestedIn: ['section', 'container', 'columns'] },
  [BlockTypes.BUTTON]: { canHaveChildren: false, canBeNestedIn: ['section', 'container', 'columns'] },
  [BlockTypes.DIVIDER]: { canHaveChildren: false, canBeNestedIn: ['section', 'container', 'columns'] },
  [BlockTypes.SPACER]: { canHaveChildren: false, canBeNestedIn: ['section', 'container', 'columns'] },
  [BlockTypes.SOCIAL]: { canHaveChildren: false, canBeNestedIn: ['section', 'container', 'columns'] },
  [BlockTypes.COLUMNS]: { canHaveChildren: true, canBeNestedIn: ['section', 'container'], maxDepth: 2 },
  [BlockTypes.CONTAINER]: { canHaveChildren: true, canBeNestedIn: ['section'], maxDepth: 3 },
  [BlockTypes.SECTION]: { canHaveChildren: true, canBeNestedIn: ['root'], maxDepth: 4 }
};

// ============================================
// TREE UTILITY FUNCTIONS
// ============================================

const TreeUtils = {
  generateId: () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  findById: (blocks, id) => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.children) {
        const found = TreeUtils.findById(block.children, id);
        if (found) return found;
      }
    }
    return null;
  },
  
  findParent: (blocks, childId, parent = null) => {
    for (const block of blocks) {
      if (block.id === childId) return parent;
      if (block.children) {
        const found = TreeUtils.findParent(block.children, childId, block);
        if (found) return found;
      }
    }
    return null;
  },
  
  getDepth: (blocks, id, currentDepth = 0) => {
    for (const block of blocks) {
      if (block.id === id) return currentDepth;
      if (block.children) {
        const depth = TreeUtils.getDepth(block.children, id, currentDepth + 1);
        if (depth !== -1) return depth;
      }
    }
    return -1;
  },
  
  isAncestor: (blocks, ancestorId, descendantId) => {
    const ancestor = TreeUtils.findById(blocks, ancestorId);
    if (!ancestor || !ancestor.children) return false;
    
    const checkChildren = (children) => {
      for (const child of children) {
        if (child.id === descendantId) return true;
        if (child.children && checkChildren(child.children)) return true;
      }
      return false;
    };
    
    return checkChildren(ancestor.children);
  },
  
  insertBlock: (blocks, newBlock, parentId = null, position = -1) => {
    if (!parentId) {
      const newBlocks = [...blocks];
      if (position === -1) {
        newBlocks.push(newBlock);
      } else {
        newBlocks.splice(position, 0, newBlock);
      }
      return newBlocks;
    }
    
    return blocks.map(block => {
      if (block.id === parentId) {
        const children = block.children || [];
        const newChildren = [...children];
        if (position === -1) {
          newChildren.push(newBlock);
        } else {
          newChildren.splice(position, 0, newBlock);
        }
        return { ...block, children: newChildren };
      }
      if (block.children) {
        return { ...block, children: TreeUtils.insertBlock(block.children, newBlock, parentId, position) };
      }
      return block;
    });
  },
  
  removeBlock: (blocks, id) => {
    return blocks.filter(block => {
      if (block.id === id) return false;
      if (block.children) {
        block.children = TreeUtils.removeBlock(block.children, id);
      }
      return true;
    });
  },
  
  updateBlock: (blocks, id, updates) => {
    return blocks.map(block => {
      if (block.id === id) {
        return { ...block, ...updates };
      }
      if (block.children) {
        return { ...block, children: TreeUtils.updateBlock(block.children, id, updates) };
      }
      return block;
    });
  },
  
  moveBlock: (blocks, blockId, targetParentId, position) => {
    const block = TreeUtils.findById(blocks, blockId);
    if (!block) return blocks;
    
    let newBlocks = TreeUtils.removeBlock(blocks, blockId);
    newBlocks = TreeUtils.insertBlock(newBlocks, block, targetParentId, position);
    
    return newBlocks;
  },
  
  flatten: (blocks, depth = 0) => {
    const result = [];
    for (const block of blocks) {
      result.push({ ...block, depth });
      if (block.children) {
        result.push(...TreeUtils.flatten(block.children, depth + 1));
      }
    }
    return result;
  }
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

const DragValidation = {
  canDropInside: (blocks, draggedId, targetId) => {
    const draggedBlock = TreeUtils.findById(blocks, draggedId);
    const targetBlock = TreeUtils.findById(blocks, targetId);
    
    if (!draggedBlock || !targetBlock) return false;
    if (draggedId === targetId) return false;
    if (TreeUtils.isAncestor(blocks, draggedId, targetId)) return false;
    
    const targetCapabilities = BlockCapabilities[targetBlock.type];
    if (!targetCapabilities?.canHaveChildren) return false;
    
    const draggedCapabilities = BlockCapabilities[draggedBlock.type];
    if (!draggedCapabilities?.canBeNestedIn?.includes(targetBlock.type)) return false;
    
    const currentDepth = TreeUtils.getDepth(blocks, targetId);
    const maxDepth = targetCapabilities.maxDepth || 5;
    if (currentDepth >= maxDepth) return false;
    
    return true;
  },
  
  canDropAdjacent: (blocks, draggedId, targetId) => {
    const draggedBlock = TreeUtils.findById(blocks, draggedId);
    const targetBlock = TreeUtils.findById(blocks, targetId);
    
    if (!draggedBlock || !targetBlock) return false;
    if (draggedId === targetId) return false;
    
    const targetParent = TreeUtils.findParent(blocks, targetId);
    
    if (!targetParent) {
      const draggedCapabilities = BlockCapabilities[draggedBlock.type];
      return draggedCapabilities?.canBeNestedIn?.includes('root') || draggedBlock.type === BlockTypes.SECTION;
    }
    
    const draggedCapabilities = BlockCapabilities[draggedBlock.type];
    return draggedCapabilities?.canBeNestedIn?.includes(targetParent.type) || false;
  }
};

// ============================================
// EMAIL HTML EXPORT PIPELINE
// ============================================

const EmailExport = {
  serializeBlock: (block, depth = 0) => {
    const serializers = {
      [BlockTypes.TEXT]: (b) => `
        <tr>
          <td style="padding:10px 0;">
            ${b.content || '<p>Empty text block</p>'}
          </td>
        </tr>`,
      
      [BlockTypes.IMAGE]: (b) => {
        const width = b.width || '100%';
        const align = b.align?.replace('text-', '').replace('justify-', '') || 'center';
        const caption = b.caption ? `<div style="font-size:12px;color:#666;font-style:italic;margin-top:8px;">${b.caption}</div>` : '';
        
        return `
        <tr>
          <td align="${align}" style="padding:10px 0;">
            <img src="${b.content}" alt="${b.alt || 'Image'}" width="${width}" style="max-width:100%;height:auto;display:block;" />
            ${caption}
          </td>
        </tr>`;
      },
      
      [BlockTypes.BUTTON]: (b) => {
        const bgColor = b.bgColor || '#3b82f6';
        const textColor = b.textColor || '#ffffff';
        const align = b.align?.replace('justify-', '') || 'center';
        
        return `
        <tr>
          <td align="${align}" style="padding:10px 0;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${b.link}" style="height:44px;v-text-anchor:middle;width:auto;" arcsize="18%" stroke="f" fillcolor="${bgColor}">
              <w:anchorlock/>
              <center style="color:${textColor};font-family:sans-serif;font-size:16px;font-weight:bold;padding:0 24px;">${b.content}</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="${b.link}" style="background-color:${bgColor};border-radius:8px;color:${textColor};display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:16px;font-weight:600;padding:12px 24px;text-align:center;text-decoration:none;-webkit-text-size-adjust:none;mso-hide:all;">${b.content}</a>
            <!--<![endif]-->
          </td>
        </tr>`;
      },
      
      [BlockTypes.DIVIDER]: (b) => `
        <tr>
          <td style="padding:10px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid ${b.color || '#e5e7eb'};">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>`,
      
      [BlockTypes.SPACER]: (b) => {
        const height = b.height || 20;
        return `
        <tr>
          <td style="height:${height}px;line-height:${height}px;font-size:${height}px;">&nbsp;</td>
        </tr>`;
      },
      
      [BlockTypes.SOCIAL]: (b) => {
        const align = b.align?.replace('justify-', '') || 'center';
        const icons = b.icons || [];

        const enc = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        const brandMeta = {
          facebook:  {
            color: '#1877f2',
            src: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="white"/></svg>`),
          },
          twitter:   {
            color: '#1da1f2',
            src: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" fill="white"/></svg>`),
          },
          instagram: {
            color: '#e1306c',
            gradient: 'background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);',
            src: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`),
          },
          linkedin:  {
            color: '#0a66c2',
            src: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`),
          },
          youtube:   {
            color: '#ff0000',
            src: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`),
          },
        };

        const iconHTML = icons.map(platform => {
          const meta = brandMeta[platform];
          if (!meta) return '';
          const href = { facebook: b.facebookUrl, twitter: b.twitterUrl, instagram: b.instagramUrl, linkedin: b.linkedinUrl, youtube: b.youtubeUrl }[platform] || '#';
          return `<a href="${href}" style="display:inline-block;margin:0 5px;text-decoration:none;border:0;" target="_blank"><table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;"><tr><td width="40" height="40" align="center" valign="middle" bgcolor="${meta.color}" style="border-radius:20px;width:40px;height:40px;background-color:${meta.color};${meta.gradient || ''}"><img src="${meta.src}" width="22" height="22" alt="${platform}" style="display:block;border:0;outline:0;" /></td></tr></table></a>`;
        }).join('');
        
        return `
        <tr>
          <td align="${align}" style="padding:10px 0;">
            ${iconHTML}
          </td>
        </tr>`;
      },
      
      [BlockTypes.COLUMNS]: (b) => {
        const columnCount = b.columnCount || 2;
        const columnWidth = Math.floor(100 / columnCount);
        const columnGap = b.columnGap || 16;
        const paddingTop = b.paddingTop || 0;
        const paddingBottom = b.paddingBottom || 0;
        const paddingLeft = b.paddingLeft || 0;
        const paddingRight = b.paddingRight || 0;
        const bgColor = b.bgColor === 'none' ? 'transparent' : (b.bgColor || '#ffffff');
        const verticalAlign = b.verticalAlign === 'middle' ? 'middle' : b.verticalAlign === 'bottom' ? 'bottom' : 'top';
        const children = b.children || [];
        
        const columnsHTML = children.map((child, idx) => {
          const childHTML = EmailExport.serializeBlock(child, depth + 1);
          const marginRight = idx < columnCount - 1 ? `margin-right:${columnGap}px;` : '';
          return `
          <td width="${columnWidth}%" valign="${verticalAlign}" style="padding:${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;${marginRight}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${childHTML || '<tr><td><p>Empty column</p></td></tr>'}
            </table>
          </td>`;
        }).join('');
        
        return `
        <tr>
          <td style="padding:10px 0;background-color:${bgColor};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${columnsHTML}
              </tr>
            </table>
          </td>
        </tr>`;
      },
      
      [BlockTypes.CONTAINER]: (b) => {
        const bgColor = b.bgColor || 'transparent';
        const paddingTop = b.paddingTop || 20;
        const paddingBottom = b.paddingBottom || 20;
        const paddingLeft = b.paddingLeft || 20;
        const paddingRight = b.paddingRight || 20;
        
        const childrenHTML = b.children?.map(child => EmailExport.serializeBlock(child, depth + 1)).join('') || '';
        
        return `
        <tr>
          <td style="background-color:${bgColor};padding:${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${childrenHTML || `<tr><td>${b.content || '<p>Empty container</p>'}</td></tr>`}
            </table>
          </td>
        </tr>`;
      },
      
      [BlockTypes.SECTION]: (b) => {
        const bgColor = b.bgColor || '#ffffff';
        const childrenHTML = b.children?.map(child => EmailExport.serializeBlock(child, depth + 1)).join('') || '';
        
        return `
        <tr>
          <td style="background-color:${bgColor};padding:20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${childrenHTML || '<tr><td><p>Empty section</p></td></tr>'}
            </table>
          </td>
        </tr>`;
      }
    };
    
    const serializer = serializers[block.type];
    return serializer ? serializer(block) : '';
  },
  
  exportToHTML: (blocks) => {
    const bodyContent = blocks.map(block => EmailExport.serializeBlock(block)).join('');
    
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; }
    @media screen and (max-width: 600px) {
      .mobile-full-width { width: 100% !important; }
      .mobile-padding { padding: 10px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;max-width:600px;" class="mobile-full-width">
          ${bodyContent}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
};

// ============================================
// COLOR SWATCHES
// ============================================

const COLOR_SWATCHES = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8', '#334155', '#1e293b',
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#2bb5ad', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899',
];

const ColorSwatches = ({ onChange }) => (
  <div className="flex flex-wrap gap-1.5 mt-2">
    {COLOR_SWATCHES.map(color => (
      <button
        key={color}
        type="button"
        title={color}
        onClick={() => onChange(color)}
        className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ring-1 ring-slate-200"
        style={{ backgroundColor: color }}
      />
    ))}
  </div>
);

// ============================================
// RICH TEXT EDITOR COMPONENT
// ============================================

const RichTextEditor = ({ content, onChange }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const editorRef = React.useRef(null);
  
  React.useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, []);
  
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    const newContent = editorRef.current.innerHTML;
    onChange(newContent);
  };
  
  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };
  
  const handleInput = () => {
    const newContent = editorRef.current.innerHTML;
    onChange(newContent);
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-slate-50 border-b p-2 flex flex-wrap gap-1">
        <button onClick={() => execCommand('bold')} className="p-2 hover:bg-slate-200 rounded" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => execCommand('italic')} className="p-2 hover:bg-slate-200 rounded" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => execCommand('underline')} className="p-2 hover:bg-slate-200 rounded" title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px bg-slate-300 mx-1" />
        <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-slate-200 rounded" title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-slate-200 rounded" title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-slate-200 rounded" title="Align Right">
          <AlignRight className="w-4 h-4" />
        </button>
        <div className="w-px bg-slate-300 mx-1" />
        <select onChange={(e) => execCommand('fontSize', e.target.value)} className="px-2 py-1 border rounded text-sm" defaultValue="3">
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
        <div className="w-px bg-slate-300 mx-1" />
        <button onClick={() => setShowLinkModal(true)} className="p-2 hover:bg-slate-200 rounded" title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <input type="color" onChange={(e) => execCommand('foreColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" title="Text Color" />
      </div>
      <div className="bg-slate-50 border-b px-2 py-1.5 flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-slate-400 font-medium mr-1">Text color:</span>
        {COLOR_SWATCHES.map(color => (
          <button
            key={color}
            type="button"
            title={color}
            onMouseDown={(e) => { e.preventDefault(); execCommand('foreColor', color); }}
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ring-1 ring-slate-200"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} className="p-4 min-h-[150px] focus:outline-none prose max-w-none" />
      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Insert Link"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={insertLink} className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors">Insert</button>
          </div>
        }>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">URL</label>
          <input type="url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
        </div>
      </Modal>
    </div>
  );
};

export { BlockTypes, TreeUtils, DragValidation, EmailExport, RichTextEditor };
// PART 2: Nested Block Components and Main Builder
// This file contains the implementation of nested drag-drop and the main builder component
// Append this to NestedEmailBuilder.jsx after the exports

// ============================================
// TEMPLATE LIBRARY (Tree Structure)
// ============================================

const TEMPLATE_LIBRARY = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    category: 'Onboarding',
    thumbnail: '👋',
    blocks: [
      { 
        id: TreeUtils.generateId(), 
        type: BlockTypes.SECTION, 
        bgColor: '#ffffff',
        children: [
          { id: TreeUtils.generateId(), type: BlockTypes.TEXT, content: '<h1 style="text-align: center; color: #2bb5ad;">Welcome to Our Community!</h1>' },
          { id: TreeUtils.generateId(), type: BlockTypes.SPACER, height: 20 },
          { id: TreeUtils.generateId(), type: BlockTypes.TEXT, content: '<p style="text-align: center;">We\'re thrilled to have you here. Let\'s get started on this exciting journey together.</p>' },
          { id: TreeUtils.generateId(), type: BlockTypes.SPACER, height: 30 },
          { id: TreeUtils.generateId(), type: BlockTypes.BUTTON, content: 'Get Started', link: '#', bgColor: '#2bb5ad', textColor: '#ffffff', align: 'justify-center' },
        ]
      }
    ]
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'Marketing',
    thumbnail: '📰',
    blocks: [
      {
        id: TreeUtils.generateId(),
        type: BlockTypes.SECTION,
        bgColor: '#ffffff',
        children: [
          { id: TreeUtils.generateId(), type: BlockTypes.TEXT, content: '<h2>Latest Updates</h2>' },
          { id: TreeUtils.generateId(), type: BlockTypes.DIVIDER, color: '#2bb5ad' },
          { id: TreeUtils.generateId(), type: BlockTypes.SPACER, height: 20 },
          {
            id: TreeUtils.generateId(),
            type: BlockTypes.CONTAINER,
            bgColor: '#f8fafc',
            paddingTop: 30,
            paddingBottom: 30,
            paddingLeft: 30,
            paddingRight: 30,
            children: [
              { id: TreeUtils.generateId(), type: BlockTypes.TEXT, content: '<h3>Feature Highlight</h3><p>Discover our latest feature that will transform your workflow.</p>' },
              { id: TreeUtils.generateId(), type: BlockTypes.IMAGE, content: 'https://placehold.co/600x300/e2e8f0/94a3b8?text=Image', alt: 'Feature Image', width: '100%', align: 'justify-center' },
            ]
          },
          { id: TreeUtils.generateId(), type: BlockTypes.SPACER, height: 20 },
          { id: TreeUtils.generateId(), type: BlockTypes.BUTTON, content: 'Read More', link: '#', bgColor: '#3b82f6', textColor: '#ffffff', align: 'justify-center' },
        ]
      }
    ]
  }
];

// ============================================
// NESTED SORTABLE BLOCK COMPONENT
// ============================================

const NestedBlock = ({ 
  block, 
  allBlocks,
  depth = 0,
  onEdit, 
  onDelete, 
  onUpdate, 
  editingBlockId, 
  onDuplicate,
  activeId,
  overId
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // Image block upload state
  const [imgTab, setImgTab] = useState('url'); // 'url' | 'upload'
  const [imgUploading, setImgUploading] = useState(false);
  const [imgUploadError, setImgUploadError] = useState('');
  const imgFileRef = useRef(null);

  // Helper: read file as base64 data URL
  const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImgUploadError('Please select a valid image file.');
      return;
    }
    setImgUploading(true);
    setImgUploadError('');
    try {
      // Upload to S3 and get presigned download URL back
      const { key, imageUrl } = await uploadAPI.uploadFile(
        file,
        'TEMPLATE_IMAGE'
      );
      if (!imageUrl) throw new Error('no_image_url');
      onUpdate({ ...block, content: imageUrl, imageKey: key || null });
    } catch {
      // Fallback: embed as base64 so the template still renders locally
      try {
        const dataUrl = await readAsDataUrl(file);
        onUpdate({ ...block, content: dataUrl, imageKey: null });
      } catch {
        setImgUploadError('Could not load image. Please try again.');
      }
    } finally {
      setImgUploading(false);
      if (imgFileRef.current) imgFileRef.current.value = '';
    }
  };
  
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({ 
    id: block.id,
    data: { block, depth }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginLeft: `${depth * 20}px`
  };
  
  const hasChildren = block.children && block.children.length > 0;
  const canHaveChildren = BlockCapabilities[block.type]?.canHaveChildren;
  const isEditing = editingBlockId === block.id;
  
  // Determine drop zone indicator
  const isOver = overId === block.id;
  const canDropHere = activeId && activeId !== block.id && DragValidation.canDropInside(allBlocks, activeId, block.id);
  const showDropIndicator = isOver && canDropHere;
  
  const renderBlockPreview = () => {
    switch (block.type) {
      case BlockTypes.TEXT:
        return <div dangerouslySetInnerHTML={{ __html: block.content }} className="prose prose-sm max-w-none" />;
      
      case BlockTypes.IMAGE:
        return (
          <div className={`${block.align || 'text-center'}`}>
            {block.content ? (
              <img
                src={block.content}
                alt={block.alt || 'Image'}
                style={{ width: block.width || '100%', maxWidth: '200px' }}
                className="rounded"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
              />
            ) : null}
            {!block.content && (
              <div className="flex items-center justify-center w-full h-16 bg-slate-100 rounded border-2 border-dashed border-slate-300 text-slate-400 text-xs">
                No image set
              </div>
            )}
            {block.caption && <p className="text-xs text-slate-600 mt-1 italic">{block.caption}</p>}
          </div>
        );
      
      case BlockTypes.BUTTON:
        return (
          <div className={`flex ${block.align || 'justify-center'}`}>
            <button style={{ backgroundColor: block.bgColor || '#3b82f6', color: block.textColor || '#ffffff', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>
              {block.content || 'Button'}
            </button>
          </div>
        );
      
      case BlockTypes.DIVIDER:
        return <hr className="border-t" style={{ borderColor: block.color || '#e5e7eb' }} />;
      
      case BlockTypes.SPACER:
        return (
          <div className="bg-slate-100 border-2 border-dashed rounded flex items-center justify-center text-slate-400 text-xs" style={{ height: `${block.height || 20}px` }}>
            {block.height || 20}px
          </div>
        );
      
      case BlockTypes.SOCIAL:
        return (() => {
          const socialMeta = {
            facebook:  { Icon: Facebook,  bg: '#1877f2' },
            twitter:   { Icon: Twitter,   bg: '#1da1f2' },
            instagram: { Icon: Instagram, bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
            linkedin:  { Icon: Linkedin,  bg: '#0a66c2' },
            youtube:   { Icon: Youtube,   bg: '#ff0000' },
          };
          return (
            <div className={`flex gap-3 ${block.align || 'justify-center'}`}>
              {block.icons?.map(platform => {
                const meta = socialMeta[platform];
                if (!meta) return null;
                const { Icon, bg } = meta;
                return (
                  <div key={platform} className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ background: bg }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                );
              })}
            </div>
          );
        })();
      
      case BlockTypes.CONTAINER:
        return (
          <div className="border-2 border-dashed rounded p-3" style={{ backgroundColor: block.bgColor || '#f8fafc' }}>
            <div className="text-xs text-slate-400 mb-1">Container {hasChildren ? `(${block.children.length} items)` : '(empty)'}</div>
          </div>
        );
      
      case BlockTypes.SECTION:
        return (
          <div className="border-2 border-slate-300 rounded p-3" style={{ backgroundColor: block.bgColor || '#ffffff' }}>
            <div className="text-xs font-medium text-slate-600 mb-1">Section {hasChildren ? `(${block.children.length} items)` : '(empty)'}</div>
          </div>
        );
      
      case BlockTypes.COLUMNS:
        const colCount = block.columnCount || 2;
        const cols = block.children || [];
        
        return (
          <div className="text-sm text-slate-600">
            <p className="font-medium">{colCount}-Column Layout</p>
            <p className="text-xs text-slate-500 mt-1">{cols.length} item{cols.length !== 1 ? 's' : ''}</p>
          </div>
        );
      
      default:
        return <div className="text-sm text-slate-400">Unknown block type</div>;
    }
  };
  
  const getBlockIcon = () => {
    const icons = {
      [BlockTypes.TEXT]: <Type className="w-4 h-4" />,
      [BlockTypes.IMAGE]: <ImageIcon className="w-4 h-4" />,
      [BlockTypes.BUTTON]: <MousePointer className="w-4 h-4" />,
      [BlockTypes.DIVIDER]: <Minus className="w-4 h-4" />,
      [BlockTypes.SPACER]: <Space className="w-4 h-4" />,
      [BlockTypes.SOCIAL]: <Mail className="w-4 h-4" />,
      [BlockTypes.COLUMNS]: <ColumnsIcon className="w-4 h-4" />,
      [BlockTypes.CONTAINER]: <Square className="w-4 h-4" />,
      [BlockTypes.SECTION]: <Layers className="w-4 h-4" />
    };
    return icons[block.type] || <Square className="w-4 h-4" />;
  };
  
  const getBlockLabel = () => {
    const labels = {
      [BlockTypes.TEXT]: 'Text',
      [BlockTypes.IMAGE]: 'Image',
      [BlockTypes.BUTTON]: 'Button',
      [BlockTypes.DIVIDER]: 'Divider',
      [BlockTypes.SPACER]: 'Spacer',
      [BlockTypes.SOCIAL]: 'Social',
      [BlockTypes.COLUMNS]: 'Columns',
      [BlockTypes.CONTAINER]: 'Container',
      [BlockTypes.SECTION]: 'Section'
    };
    return labels[block.type] || 'Block';
  };
  
  return (
    <div ref={setNodeRef} style={style} className={`mb-2 ${isDragging ? 'z-50' : ''}`}>
      <div className={`bg-white border-2 rounded-lg p-3 transition-all ${isEditing ? 'border-primary-500 shadow-lg' : showDropIndicator ? 'border-green-500 bg-green-50' : 'hover:border-primary-300'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <button {...attributes} {...listeners} className="cursor-grab hover:bg-slate-100 p-1 rounded touch-none">
              <GripVertical className="w-4 h-4 text-slate-500" />
            </button>
            {canHaveChildren && hasChildren && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-slate-100 rounded">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              {getBlockIcon()} {getBlockLabel()}
            </span>
            {depth > 0 && <span className="text-xs text-slate-400">Depth: {depth}</span>}
          </div>
          
          <div className="flex space-x-1">
            <Button size="sm" variant={isEditing ? "default" : "ghost"} onClick={() => onEdit(block.id)}>
              {isEditing ? 'Done' : 'Edit'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDuplicate(block.id)} title="Duplicate">
              <Copy className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(block.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {!isEditing && (
          <div className="border rounded p-2 bg-slate-50">
            {renderBlockPreview()}
          </div>
        )}
        
        {isEditing && (
          <div className="border-t mt-3 pt-3 space-y-3 bg-slate-50 -mx-3 -mb-3 p-3 rounded-b-lg">
            {block.type === BlockTypes.TEXT && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <RichTextEditor
                  content={block.content || ''}
                  onChange={(content) => onUpdate({ ...block, content })}
                />
              </div>
            )}
            
            {block.type === BlockTypes.IMAGE && (
              <>
                {/* Tab toggle */}
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setImgTab('url')}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      imgTab === 'url' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    onClick={() => { setImgTab('upload'); setImgUploadError(''); }}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      imgTab === 'upload' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Upload from device
                  </button>
                </div>

                {imgTab === 'url' ? (
                  <Input
                    label="Image URL"
                    value={block.content || ''}
                    onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image</label>
                    {/* Preview current image */}
                    {block.content && !imgUploading && (
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <img
                          src={block.content}
                          alt="preview"
                          className="max-h-24 mx-auto rounded object-contain"
                        />
                      </div>
                    )}
                    <input
                      ref={imgFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                    <button
                      onClick={() => imgFileRef.current?.click()}
                      disabled={imgUploading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {imgUploading ? (
                        <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Choose image file</>
                      )}
                    </button>
                    {imgUploadError && (
                      <p className="mt-2 text-xs text-red-600">{imgUploadError}</p>
                    )}
                    <p className="mt-1.5 text-xs text-slate-400">JPG, PNG, GIF, WebP supported</p>
                  </div>
                )}

                <Input
                  label="Alt Text"
                  value={block.alt || ''}
                  onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
                />
                <Input
                  label="Caption (optional)"
                  value={block.caption || ''}
                  onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Width</label>
                  <select
                    value={block.width || '100%'}
                    onChange={(e) => onUpdate({ ...block, width: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="100%">Full Width</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                    <option value="400px">400px</option>
                  </select>
                </div>
              </>
            )}
            
            {block.type === BlockTypes.BUTTON && (
              <>
                <Input
                  label="Button Text"
                  value={block.content || ''}
                  onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                />
                <Input
                  label="Link URL"
                  value={block.link || '#'}
                  onChange={(e) => onUpdate({ ...block, link: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                    <input
                      type="color"
                      value={block.bgColor || '#3b82f6'}
                      onChange={(e) => onUpdate({ ...block, bgColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                    <ColorSwatches onChange={(c) => onUpdate({ ...block, bgColor: c })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Text Color</label>
                    <input
                      type="color"
                      value={block.textColor || '#ffffff'}
                      onChange={(e) => onUpdate({ ...block, textColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                    <ColorSwatches onChange={(c) => onUpdate({ ...block, textColor: c })} />
                  </div>
                </div>
              </>
            )}
            
            {block.type === BlockTypes.DIVIDER && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                <input
                  type="color"
                  value={block.color || '#e5e7eb'}
                  onChange={(e) => onUpdate({ ...block, color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <ColorSwatches onChange={(c) => onUpdate({ ...block, color: c })} />
              </div>
            )}
            
            {block.type === BlockTypes.SPACER && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Height: {block.height || 40}px</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={block.height || 40}
                  onChange={(e) => onUpdate({ ...block, height: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
            
            {block.type === BlockTypes.SOCIAL && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Select Social Icons</label>
                  <div className="space-y-2">
                    {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
                      <label key={platform} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={block.icons?.includes(platform) || false}
                          onChange={(e) => {
                            const icons = block.icons || [];
                            const newIcons = e.target.checked
                              ? [...icons, platform]
                              : icons.filter(i => i !== platform);
                            onUpdate({ ...block, icons: newIcons });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {block.icons?.includes('facebook') && (
                  <Input
                    label="Facebook URL"
                    value={block.facebookUrl || ''}
                    onChange={(e) => onUpdate({ ...block, facebookUrl: e.target.value })}
                  />
                )}
                {block.icons?.includes('twitter') && (
                  <Input
                    label="Twitter URL"
                    value={block.twitterUrl || ''}
                    onChange={(e) => onUpdate({ ...block, twitterUrl: e.target.value })}
                  />
                )}
                {block.icons?.includes('instagram') && (
                  <Input
                    label="Instagram URL"
                    value={block.instagramUrl || ''}
                    onChange={(e) => onUpdate({ ...block, instagramUrl: e.target.value })}
                  />
                )}
                {block.icons?.includes('linkedin') && (
                  <Input
                    label="LinkedIn URL"
                    value={block.linkedinUrl || ''}
                    onChange={(e) => onUpdate({ ...block, linkedinUrl: e.target.value })}
                  />
                )}
                {block.icons?.includes('youtube') && (
                  <Input
                    label="YouTube URL"
                    value={block.youtubeUrl || ''}
                    onChange={(e) => onUpdate({ ...block, youtubeUrl: e.target.value })}
                  />
                )}
              </>
            )}
            
            {block.type === BlockTypes.SECTION && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                <input
                  type="color"
                  value={block.bgColor || '#ffffff'}
                  onChange={(e) => onUpdate({ ...block, bgColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <ColorSwatches onChange={(c) => onUpdate({ ...block, bgColor: c })} />
              </div>
            )}
            
            {block.type === BlockTypes.CONTAINER && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                  <input
                    type="color"
                    value={block.bgColor || '#f8fafc'}
                    onChange={(e) => onUpdate({ ...block, bgColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                  <ColorSwatches onChange={(c) => onUpdate({ ...block, bgColor: c })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Padding Top: {block.paddingTop || 30}px</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={block.paddingTop || 30}
                      onChange={(e) => onUpdate({ ...block, paddingTop: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Padding Bottom: {block.paddingBottom || 30}px</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={block.paddingBottom || 30}
                      onChange={(e) => onUpdate({ ...block, paddingBottom: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
            
            {block.type === BlockTypes.COLUMNS && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Columns</label>
                  <select
                    value={block.columnCount || 2}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      onUpdate({ ...block, columnCount: count });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gap Between Columns: {block.columnGap || 16}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={block.columnGap || 16}
                      onChange={(e) => onUpdate({ ...block, columnGap: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Column Width (%)</label>
                    <select
                      value={block.columnWidth || 'equal'}
                      onChange={(e) => onUpdate({ ...block, columnWidth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="equal">Equal Width</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Padding Top: {block.paddingTop || 0}px</label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={block.paddingTop || 0}
                      onChange={(e) => onUpdate({ ...block, paddingTop: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Padding Bottom: {block.paddingBottom || 0}px</label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={block.paddingBottom || 0}
                      onChange={(e) => onUpdate({ ...block, paddingBottom: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Padding Left: {block.paddingLeft || 0}px</label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={block.paddingLeft || 0}
                      onChange={(e) => onUpdate({ ...block, paddingLeft: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Padding Right: {block.paddingRight || 0}px</label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={block.paddingRight || 0}
                      onChange={(e) => onUpdate({ ...block, paddingRight: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={block.bgColor === 'none' ? '#ffffff' : block.bgColor}
                      onChange={(e) => onUpdate({ ...block, bgColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                      disabled={block.bgColor === 'none'}
                    />
                    <button
                      onClick={() => onUpdate({ ...block, bgColor: block.bgColor === 'none' ? '#ffffff' : 'none' })}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        block.bgColor === 'none'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title={block.bgColor === 'none' ? 'Add background' : 'Remove background'}
                    >
                      {block.bgColor === 'none' ? '✕' : '✕'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vertical Alignment</label>
                  <select
                    value={block.verticalAlign || 'top'}
                    onChange={(e) => onUpdate({ ...block, verticalAlign: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>

                <p className="text-xs text-slate-500">Drag blocks into this column layout to organize content side-by-side.</p>
              </div>
            )}
          </div>
        )}
        
        {canHaveChildren && !hasChildren && isExpanded && (
          <div className="mt-2 border-2 border-dashed rounded p-4 text-center text-sm text-slate-400">
            Drop blocks here or click + to add
          </div>
        )}
      </div>
      
      {hasChildren && isExpanded && block.type !== BlockTypes.COLUMNS && (
        <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-200 pl-2">
          <SortableContext items={block.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {block.children.map(child => (
              <NestedBlock
                key={child.id}
                block={child}
                allBlocks={allBlocks}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdate={onUpdate}
                editingBlockId={editingBlockId}
                onDuplicate={onDuplicate}
                activeId={activeId}
                overId={overId}
              />
            ))}
          </SortableContext>
        </div>
      )}
      
      {hasChildren && isExpanded && block.type === BlockTypes.COLUMNS && (
        <div className="mt-2 space-y-2">
          <SortableContext items={block.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {block.children.map(child => (
              <NestedBlock
                key={child.id}
                block={child}
                allBlocks={allBlocks}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdate={onUpdate}
                editingBlockId={editingBlockId}
                onDuplicate={onDuplicate}
                activeId={activeId}
                overId={overId}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN ENHANCED EMAIL BUILDER
// ============================================

const EnhancedEmailBuilder = ({ initialBlocks = [], onChange }) => {
  const [blocks, setBlocks] = useState(initialBlocks.length > 0 ? initialBlocks : []);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [history, setHistory] = useState([initialBlocks.length > 0 ? initialBlocks : []]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedHTML, setExportedHTML] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const updateBlocks = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    onChange?.(newBlocks);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [historyIndex, history, onChange]);
  
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  };
  
  const loadTemplate = (template) => {
    updateBlocks(template.blocks);
    setShowTemplateLibrary(false);
  };
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragOver = (event) => {
    setOverId(event.over?.id || null);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    
    if (!over || active.id === over.id) return;
    
    const activeBlock = TreeUtils.findById(blocks, active.id);
    const overBlock = TreeUtils.findById(blocks, over.id);
    
    if (!activeBlock || !overBlock) return;
    
    // Find parents
    const activeParent = TreeUtils.findParent(blocks, active.id);
    const overParent = TreeUtils.findParent(blocks, over.id);
    
    // Get the arrays to work with
    const activeParentChildren = activeParent ? activeParent.children : blocks;
    const overParentChildren = overParent ? overParent.children : blocks;
    
    // Case 1: Try to drop inside first (higher priority for containers/sections/columns)
    if (DragValidation.canDropInside(blocks, active.id, over.id)) {
      const newBlocks = TreeUtils.moveBlock(blocks, active.id, over.id, -1);
      updateBlocks(newBlocks);
    }
    // Case 2: Reordering within the same parent
    else if (activeParent?.id === overParent?.id || (!activeParent && !overParent)) {
      const oldIndex = activeParentChildren.findIndex(b => b.id === active.id);
      const newIndex = activeParentChildren.findIndex(b => b.id === over.id);
      
      if (oldIndex !== newIndex) {
        const reorderedChildren = [...activeParentChildren];
        const [movedBlock] = reorderedChildren.splice(oldIndex, 1);
        reorderedChildren.splice(newIndex, 0, movedBlock);
        
        if (activeParent) {
          const newBlocks = TreeUtils.updateBlock(blocks, activeParent.id, { children: reorderedChildren });
          updateBlocks(newBlocks);
        } else {
          updateBlocks(reorderedChildren);
        }
      }
    }
    // Case 3: Moving to become a sibling of the over block (within parent)
    else if (overParent && DragValidation.canDropAdjacent(blocks, active.id, over.id)) {
      // Remove from current parent
      let newBlocks = TreeUtils.removeBlock(blocks, active.id);
      // Find position of over block in its parent
      const overBlockIndex = overParent.children.findIndex(b => b.id === over.id);
      // Insert after the over block
      newBlocks = TreeUtils.insertBlock(newBlocks, activeBlock, overParent.id, overBlockIndex + 1);
      updateBlocks(newBlocks);
    }
    // Case 4: Moving to root level (for SECTION blocks only)
    else if (!overParent && DragValidation.canDropAdjacent(blocks, active.id, over.id)) {
      // Remove from current parent
      let newBlocks = TreeUtils.removeBlock(blocks, active.id);
      // Find position of over block at root
      const overBlockIndex = newBlocks.findIndex(b => b.id === over.id);
      // Insert after the over block at root level
      newBlocks = TreeUtils.insertBlock(newBlocks, activeBlock, null, overBlockIndex + 1);
      updateBlocks(newBlocks);
    }
  };
  
  const addBlock = (type, parentId = null) => {
    const newBlock = {
      id: TreeUtils.generateId(),
      type,
      ...(type === BlockTypes.TEXT && { content: '<p>Enter your text here...</p>' }),
      ...(type === BlockTypes.IMAGE && { content: 'https://via.placeholder.com/600x300', alt: 'Image', width: '100%', align: 'justify-center' }),
      ...(type === BlockTypes.BUTTON && { content: 'Click Here', link: '#', bgColor: '#3b82f6', textColor: '#ffffff', align: 'justify-center' }),
      ...(type === BlockTypes.DIVIDER && { color: '#e5e7eb' }),
      ...(type === BlockTypes.SPACER && { height: 40 }),
      ...(type === BlockTypes.SOCIAL && { icons: ['facebook', 'twitter', 'instagram'], align: 'justify-center' }),
      ...(type === BlockTypes.COLUMNS && { columnCount: 2, columnGap: 16, columnWidth: 'equal', paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, bgColor: '#ffffff', verticalAlign: 'top', children: [] }),
      ...(type === BlockTypes.CONTAINER && { bgColor: '#f8fafc', paddingTop: 30, paddingBottom: 30, paddingLeft: 30, paddingRight: 30, children: [] }),
      ...(type === BlockTypes.SECTION && { bgColor: '#ffffff', children: [] })
    };
    
    const newBlocks = TreeUtils.insertBlock(blocks, newBlock, parentId, -1);
    updateBlocks(newBlocks);
  };
  
  const handleDuplicate = (blockId) => {
    const block = TreeUtils.findById(blocks, blockId);
    if (block) {
      const duplicatedBlock = { ...block, id: TreeUtils.generateId() };
      const parent = TreeUtils.findParent(blocks, blockId);
      const newBlocks = TreeUtils.insertBlock(blocks, duplicatedBlock, parent?.id || null, -1);
      updateBlocks(newBlocks);
    }
  };
  
  const handleEdit = (blockId) => {
    setEditingBlockId(editingBlockId === blockId ? null : blockId);
  };
  
  const handleDelete = (id) => {
    const newBlocks = TreeUtils.removeBlock(blocks, id);
    updateBlocks(newBlocks);
    if (editingBlockId === id) {
      setEditingBlockId(null);
    }
  };
  
  const handleUpdate = (updatedBlock) => {
    const newBlocks = TreeUtils.updateBlock(blocks, updatedBlock.id, updatedBlock);
    updateBlocks(newBlocks);
  };
  
  const exportHTML = () => {
    const html = EmailExport.exportToHTML(blocks);
    setExportedHTML(html);
    setShowExportModal(true);
  };
  
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportedHTML).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  
  const downloadHTML = () => {
    const blob = new Blob([exportedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowTemplateLibrary(true)} icon={<Layers className="w-4 h-4" />}>
              Templates
            </Button>
            <div className="w-px h-6 bg-slate-300" />
            <Button size="sm" variant="ghost" onClick={undo} disabled={historyIndex === 0} icon={<Undo2 className="w-4 h-4" />} title="Undo" />
            <Button size="sm" variant="ghost" onClick={redo} disabled={historyIndex === history.length - 1} icon={<Redo2 className="w-4 h-4" />} title="Redo" />
            <div className="w-px h-6 bg-slate-300" />
            <Button size="sm" variant="outline" onClick={exportHTML} icon={<Download className="w-4 h-4" />}>
              Export HTML
            </Button>
          </div>
          <div className="text-xs text-slate-500">
            {blocks.length} root blocks • Tree structure enabled
          </div>
        </div>
      </div>

      {/* Add Block Menu */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Add Content Block</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { type: BlockTypes.SECTION,    icon: <Layers className="w-5 h-5 mx-auto mb-1 text-slate-600" />,      label: 'Section' },
            { type: BlockTypes.CONTAINER,  icon: <Square className="w-5 h-5 mx-auto mb-1 text-slate-600" />,       label: 'Container' },
            { type: BlockTypes.TEXT,       icon: <Type className="w-5 h-5 mx-auto mb-1 text-slate-600" />,         label: 'Text' },
            { type: BlockTypes.IMAGE,      icon: <ImageIcon className="w-5 h-5 mx-auto mb-1 text-slate-600" />,    label: 'Image' },
            { type: BlockTypes.BUTTON,     icon: <MousePointer className="w-5 h-5 mx-auto mb-1 text-slate-600" />, label: 'Button' },
            { type: BlockTypes.COLUMNS,    icon: <ColumnsIcon className="w-5 h-5 mx-auto mb-1 text-slate-600" />,  label: 'Columns' },
            { type: BlockTypes.DIVIDER,    icon: <Minus className="w-5 h-5 mx-auto mb-1 text-slate-600" />,        label: 'Divider' },
            { type: BlockTypes.SPACER,     icon: <Space className="w-5 h-5 mx-auto mb-1 text-slate-600" />,        label: 'Spacer' },
            { type: BlockTypes.SOCIAL,     icon: <Mail className="w-5 h-5 mx-auto mb-1 text-slate-600" />,         label: 'Social' },
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="w-20 p-3 border-2 border-dashed rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center shrink-0"
            >
              {icon}
              <span className="text-xs font-medium block">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Blocks - Nested Rendering */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Layers className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600 mb-2">No blocks yet</p>
          <p className="text-sm text-slate-500">Start with a Section block to create your email</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <NestedBlock
                  key={block.id}
                  block={block}
                  allBlocks={blocks}
                  depth={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  editingBlockId={editingBlockId}
                  onDuplicate={handleDuplicate}
                  activeId={activeId}
                  overId={overId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {/* Template Library Modal */}
      <Modal isOpen={showTemplateLibrary} onClose={() => setShowTemplateLibrary(false)} title="Template Library" size="lg">
        <div className="grid md:grid-cols-2 gap-4">
          {TEMPLATE_LIBRARY.map((template) => (
            <button
              key={template.id}
              onClick={() => loadTemplate(template)}
              className="border-2 border-slate-200 rounded-2xl p-5 hover:border-primary-400 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{template.thumbnail}</span>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">{template.name}</h4>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{template.category}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">{template.blocks.length} block{template.blocks.length !== 1 ? 's' : ''}</p>
            </button>
          ))}
        </div>
      </Modal>
      
      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Email HTML" size="lg">
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-words">{exportedHTML}</pre>
          </div>
          <div className="flex gap-2">
            <button onClick={copyToClipboard}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${copySuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}>
              {copySuccess ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy to Clipboard</>}
            </button>
            <button onClick={downloadHTML}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors">
              <Download className="w-4 h-4" />Download HTML
            </button>
          </div>
          <div className="text-sm text-slate-500 space-y-1.5">
            <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Email-safe table-based layout</p>
            <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Outlook compatibility with conditional comments</p>
            <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Responsive mobile design</p>
            <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Dark mode support</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedEmailBuilder;
