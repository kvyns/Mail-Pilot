import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
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
  Palette
} from 'lucide-react';

// Rich Text Editor Component
const RichTextEditor = ({ content, onChange }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const editorRef = React.useRef(null);
  
  // Set initial content only once
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
      {/* Toolbar */}
      <div className="bg-slate-50 border-b p-2 flex flex-wrap gap-1">
        <button
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-slate-200 rounded"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-slate-200 rounded"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-slate-200 rounded"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px bg-slate-300 mx-1" />
        
        <button
          onClick={() => execCommand('justifyLeft')}
          className="p-2 hover:bg-slate-200 rounded"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          className="p-2 hover:bg-slate-200 rounded"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          className="p-2 hover:bg-slate-200 rounded"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        
        <div className="w-px bg-slate-300 mx-1" />
        
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="px-2 py-1 border rounded text-sm"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
        
        <div className="w-px bg-slate-300 mx-1" />
        
        <button
          onClick={() => setShowLinkModal(true)}
          className="p-2 hover:bg-slate-200 rounded"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        
        <input
          type="color"
          onChange={(e) => execCommand('foreColor', e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
          title="Text Color"
        />
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[150px] focus:outline-none prose max-w-none"
      />
      
      {/* Link Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Insert Link"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowLinkModal(false)}>Cancel</Button>
            <Button onClick={insertLink}>Insert</Button>
          </div>
        }
      >
        <Input
          label="URL"
          placeholder="https://example.com"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
      </Modal>
    </div>
  );
};

// Sortable Block Component
const SortableBlock = ({ block, onEdit, onDelete, onUpdate, isEditing }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const renderBlockPreview = () => {
    switch (block.type) {
      case 'text':
        return <div dangerouslySetInnerHTML={{ __html: block.content }} className="prose max-w-none" />;
      case 'image':
        return (
          <div className={`flex ${block.align || 'justify-center'}`}>
            <img 
              src={block.content} 
              alt={block.alt || 'Image'} 
              style={{ width: block.width || 'auto', maxWidth: '100%' }}
              className="rounded" 
            />
          </div>
        );
      case 'button':
        return (
          <div className={`flex ${block.align || 'justify-center'}`}>
            <button
              style={{
                backgroundColor: block.bgColor || '#3b82f6',
                color: block.textColor || '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              {block.content || 'Button'}
            </button>
          </div>
        );
      case 'divider':
        return <hr className="border-t" style={{ borderColor: block.color || '#e5e7eb' }} />;
      case 'spacer':
        return (
          <div 
            className="bg-slate-100 border-2 border-dashed rounded flex items-center justify-center text-slate-400"
            style={{ height: `${block.height || 20}px` }}
          >
            <span className="text-xs">Spacer: {block.height || 20}px</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderEditForm = () => {
    if (!isEditing) return null;
    
    return (
      <div className="border-t mt-3 pt-3 space-y-4 bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-lg">
        {block.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <RichTextEditor
              content={block.content}
              onChange={(content) => onUpdate({ ...block, content })}
            />
          </div>
        )}
        
        {block.type === 'image' && (
          <>
            <Input
              label="Image URL"
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            />
            <Input
              label="Alt Text"
              value={block.alt || ''}
              onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Width</label>
              <select
                value={block.width}
                onChange={(e) => onUpdate({ ...block, width: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="100%">Full Width</option>
                <option value="75%">75%</option>
                <option value="50%">50%</option>
                <option value="300px">300px</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alignment</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => onUpdate({ ...block, align: 'justify-start' })}
                  className={`p-3 border rounded-lg ${block.align === 'justify-start' ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <AlignLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onUpdate({ ...block, align: 'justify-center' })}
                  className={`p-3 border rounded-lg ${block.align === 'justify-center' ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <AlignCenter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onUpdate({ ...block, align: 'justify-end' })}
                  className={`p-3 border rounded-lg ${block.align === 'justify-end' ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <AlignRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
        
        {block.type === 'button' && (
          <>
            <Input
              label="Button Text"
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            />
            <Input
              label="Link URL"
              value={block.link}
              onChange={(e) => onUpdate({ ...block, link: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                <input
                  type="color"
                  value={block.bgColor}
                  onChange={(e) => onUpdate({ ...block, bgColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Text Color</label>
                <input
                  type="color"
                  value={block.textColor}
                  onChange={(e) => onUpdate({ ...block, textColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alignment</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => onUpdate({ ...block, align: 'justify-start' })}
                  className={`p-3 border rounded-lg ${block.align === 'justify-start' ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <AlignLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onUpdate({ ...block, align: 'justify-center' })}
                  className={`p-3 border rounded-lg ${block.align === 'justify-center' ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <AlignCenter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onUpdate({ ...block, align: 'justify-end' })}
                  className={`p-3 border rounded-lg ${block.align === 'justify-end' ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <AlignRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
        
        {block.type === 'divider' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
            <input
              type="color"
              value={block.color}
              onChange={(e) => onUpdate({ ...block, color: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        )}
        
        {block.type === 'spacer' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Height (px)</label>
            <input
              type="range"
              min="10"
              max="200"
              value={block.height}
              onChange={(e) => onUpdate({ ...block, height: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm text-slate-600 mt-2">{block.height}px</div>
          </div>
        )}
      </div>
    );
  };
  
  const getBlockIcon = () => {
    switch (block.type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'button': return <MousePointer className="w-4 h-4" />;
      case 'divider': return <Minus className="w-4 h-4" />;
      case 'spacer': return <Space className="w-4 h-4" />;
      default: return null;
    }
  };
  
  const getBlockLabel = () => {
    switch (block.type) {
      case 'text': return 'Text Block';
      case 'image': return 'Image Block';
      case 'button': return 'Button Block';
      case 'divider': return 'Divider';
      case 'spacer': return 'Spacer';
      default: return 'Block';
    }
  };
  
  return (
    <div ref={setNodeRef} style={style} className={`bg-white border-2 rounded-lg p-4 mb-3 transition-colors ${isEditing ? 'border-blue-500' : 'hover:border-blue-500'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button {...attributes} {...listeners} className="cursor-grab hover:bg-slate-100 p-1.5 rounded">
            <GripVertical className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
            {getBlockIcon()} {getBlockLabel()}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button size="sm" variant={isEditing ? "default" : "ghost"} onClick={() => onEdit(block.id)}>
            {isEditing ? 'Done' : 'Edit'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(block.id)}>
            Delete
          </Button>
        </div>
      </div>
      
      {!isEditing && (
        <div className="border rounded p-3 bg-slate-50">
          {renderBlockPreview()}
        </div>
      )}
      
      {renderEditForm()}
    </div>
  );
};

const EnhancedEmailBuilder = ({ initialBlocks = [], onChange }) => {
  const [blocks, setBlocks] = useState(initialBlocks.length > 0 ? initialBlocks : []);
  const [editingBlockId, setEditingBlockId] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const updateBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newBlocks = arrayMove(items, oldIndex, newIndex);
        onChange?.(newBlocks);
        return newBlocks;
      });
    }
  };
  
  const addBlock = (type) => {
    let newBlock;
    
    switch (type) {
      case 'text':
        newBlock = {
          id: Date.now().toString(),
          type: 'text',
          content: '<p>Enter your text here...</p>',
        };
        break;
      case 'image':
        newBlock = {
          id: Date.now().toString(),
          type: 'image',
          content: 'https://via.placeholder.com/600x300',
          alt: 'Image',
          width: '100%',
          align: 'justify-center',
        };
        break;
      case 'button':
        newBlock = {
          id: Date.now().toString(),
          type: 'button',
          content: 'Click Here',
          link: '#',
          bgColor: '#3b82f6',
          textColor: '#ffffff',
          align: 'justify-center',
        };
        break;
      case 'divider':
        newBlock = {
          id: Date.now().toString(),
          type: 'divider',
          color: '#e5e7eb',
        };
        break;
      case 'spacer':
        newBlock = {
          id: Date.now().toString(),
          type: 'spacer',
          height: 40,
        };
        break;
      default:
        return;
    }
    
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
    setShowBlockMenu(false);
  };
  
  const handleEdit = (blockId) => {
    setEditingBlockId(editingBlockId === blockId ? null : blockId);
  };
  
  const handleBlockUpdate = (updatedBlock) => {
    const newBlocks = blocks.map((b) =>
      b.id === updatedBlock.id ? updatedBlock : b
    );
    updateBlocks(newBlocks);
  };
  
  const handleDelete = (id) => {
    const newBlocks = blocks.filter((b) => b.id !== id);
    updateBlocks(newBlocks);
    if (editingBlockId === id) {
      setEditingBlockId(null);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Add Block Menu */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Add Block</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => addBlock('text')}
            className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Type className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <span className="text-sm font-medium">Text</span>
          </button>
          <button
            onClick={() => addBlock('image')}
            className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <ImageIcon className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <span className="text-sm font-medium">Image</span>
          </button>
          <button
            onClick={() => addBlock('button')}
            className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <MousePointer className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <span className="text-sm font-medium">Button</span>
          </button>
          <button
            onClick={() => addBlock('divider')}
            className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Minus className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <span className="text-sm font-medium">Divider</span>
          </button>
          <button
            onClick={() => addBlock('spacer')}
            className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Space className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <span className="text-sm font-medium">Spacer</span>
          </button>
        </div>
      </div>
      
      {/* Blocks */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Type className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600 mb-2">No blocks yet</p>
          <p className="text-sm text-slate-500">Add blocks above to start building your email</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdate={handleBlockUpdate}
                isEditing={editingBlockId === block.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default EnhancedEmailBuilder;
