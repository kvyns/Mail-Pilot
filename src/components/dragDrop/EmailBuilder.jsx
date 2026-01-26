import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '../common/Button';
import { GripVertical, Type, Image as ImageIcon } from 'lucide-react';
import { GripVertical, Type, Image as ImageIcon } from 'lucide-react';

// Sortable Block Component
const SortableBlock = ({ block, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-lg p-4 mb-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <button {...attributes} {...listeners} className="cursor-grab hover:bg-slate-100 p-1.5 rounded">
              <GripVertical className="w-4 h-4 text-slate-500" />
            </button>
            <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              {block.type === 'text' ? (
                <><Type className="w-4 h-4" /> Text Block</>
              ) : (
                <><ImageIcon className="w-4 h-4" /> Image Block</>
              )}
            </span>
          </div>
          
          {block.type === 'text' ? (
            <div dangerouslySetInnerHTML={{ __html: block.content }} className="prose max-w-none" />
          ) : (
            <img src={block.content} alt={block.alt || 'Image'} className="max-w-full h-auto rounded" />
          )}
        </div>
        
        <div className="flex space-x-2 ml-4">
          <Button size="sm" variant="ghost" onClick={() => onEdit(block)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(block.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmailBuilder = ({ initialBlocks = [], onChange }) => {
  const [blocks, setBlocks] = useState(initialBlocks.length > 0 ? initialBlocks : []);
  const [editingBlock, setEditingBlock] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
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
  
  const addTextBlock = () => {
    const newBlock = {
      id: Date.now().toString(),
      type: 'text',
      content: '<p>Enter your text here...</p>',
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  };
  
  const addImageBlock = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      const newBlock = {
        id: Date.now().toString(),
        type: 'image',
        content: imageUrl,
        alt: 'Email image',
      };
      const newBlocks = [...blocks, newBlock];
      setBlocks(newBlocks);
      onChange?.(newBlocks);
    }
  };
  
  const handleEdit = (block) => {
    setEditingBlock(block);
    setEditContent(block.content);
  };
  
  const saveEdit = () => {
    const newBlocks = blocks.map((b) => 
      b.id === editingBlock.id ? { ...b, content: editContent } : b
    );
    setBlocks(newBlocks);
    onChange?.(newBlocks);
    setEditingBlock(null);
    setEditContent('');
  };
  
  const handleDelete = (id) => {
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  };
  
  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex space-x-2">
        <Button size="sm" onClick={addTextBlock}>
          Add Text Block
        </Button>
        <Button size="sm" variant="secondary" onClick={addImageBlock}>
          Add Image Block
        </Button>
      </div>
      
      {/* Blocks */}
      {blocks.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No blocks yet. Add text or image blocks to build your email.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
      
      {/* Edit Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Edit {editingBlock.type === 'text' ? 'Text' : 'Image'}</h3>
            
            {editingBlock.type === 'text' ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-64 px-3 py-2 border rounded-lg font-mono text-sm"
                placeholder="Enter HTML content..."
              />
            ) : (
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter image URL..."
              />
            )}
            
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setEditingBlock(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailBuilder;
