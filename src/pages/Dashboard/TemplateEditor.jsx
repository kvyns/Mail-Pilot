import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EnhancedEmailBuilder from '../../components/dragDrop/EnhancedEmailBuilder';
import { useTemplateStore } from '../../store/templateStore';
import Loader from '../../components/common/Loader';
import { Save, Eye, ArrowLeft, FileText } from 'lucide-react';

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, fetchTemplates, createTemplate, updateTemplate } = useTemplateStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [template, setTemplate] = useState({
    name: '',
    subject: '',
    schema: { blocks: [] },
  });
  
  useEffect(() => {
    const loadTemplate = async () => {
      await fetchTemplates();
      setLoading(false);
    };
    
    loadTemplate();
  }, []);
  
  // Separate effect to update template when templates are loaded
  useEffect(() => {
    if (id !== 'new' && templates.length > 0) {
      const existing = templates.find(t => t.id.toString() === id);
      if (existing) {
        setTemplate(existing);
      }
    }
  }, [id, templates]);
  
  const handleSave = async () => {
    setSaving(true);
    
    if (id === 'new') {
      const result = await createTemplate(template);
      if (result.success) {
        navigate('/dashboard/templates');
      }
    } else {
      const result = await updateTemplate(id, template);
      if (result.success) {
        // Show success message
      }
    }
    
    setSaving(false);
  };
  
  const handleBlocksChange = useCallback((blocks) => {
    setTemplate(prev => ({
      ...prev,
      schema: { blocks },
    }));
  }, []);
  
  const renderPreview = () => {
    return (
      <div className="bg-white p-8 rounded-lg border">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{template.subject || 'No Subject'}</h2>
          <div className="border-t pt-6 mt-4">
            {template.schema.blocks.map((block) => {
              if (block.type === 'text') {
                return (
                  <div 
                    key={block.id} 
                    className="mb-4"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                );
              } else if (block.type === 'image') {
                return (
                  <div key={block.id} className={`mb-4 flex ${block.align || 'justify-center'}`}>
                    <img 
                      src={block.content} 
                      alt={block.alt || 'Image'} 
                      style={{ width: block.width || 'auto', maxWidth: '100%' }}
                      className="rounded"
                    />
                  </div>
                );
              } else if (block.type === 'button') {
                return (
                  <div key={block.id} className={`mb-4 flex ${block.align || 'justify-center'}`}>
                    <a
                      href={block.link || '#'}
                      style={{
                        backgroundColor: block.bgColor || '#3b82f6',
                        color: block.textColor || '#ffffff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        fontWeight: '600',
                      }}
                    >
                      {block.content || 'Button'}
                    </a>
                  </div>
                );
              } else if (block.type === 'divider') {
                return (
                  <hr 
                    key={block.id} 
                    style={{ 
                      borderColor: block.color || '#e5e7eb',
                      margin: '24px 0',
                    }} 
                  />
                );
              } else if (block.type === 'spacer') {
                return (
                  <div 
                    key={block.id} 
                    style={{ height: `${block.height || 20}px` }}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <Loader fullScreen text="Loading template..." />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout 
      title={id === 'new' ? 'Create Template' : `Edit: ${template.name}`}
    >
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-10 -mx-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/templates')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <div className="border-l h-6" />
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Template Name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              icon={showPreview ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Template
            </Button>
          </div>
        </div>
        
        {/* Subject Line */}
        <div className="mt-4">
          <Input
            placeholder="Email Subject Line"
            value={template.subject}
            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
          />
        </div>
      </div>
      
      {/* Split View: Editor + Live Preview */}
      <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* Editor Panel */}
        <div className={showPreview ? 'order-2 lg:order-1' : ''}>
          <div className="sticky top-32">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Editor
            </h3>
            <EnhancedEmailBuilder
              initialBlocks={template.schema.blocks}
              onChange={handleBlocksChange}
            />
          </div>
        </div>
        
        {/* Live Preview Panel */}
        {showPreview && (
          <div className="order-1 lg:order-2">
            <div className="sticky top-32">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </h3>
              <div className="border-2 rounded-lg overflow-hidden bg-slate-50">
                {renderPreview()}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TemplateEditor;
