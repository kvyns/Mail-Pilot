import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useTemplateStore } from '../../store/templateStore';
import { FileText, Plus, Eye, Edit, Copy, Trash2 } from 'lucide-react';

const Templates = () => {
  const navigate = useNavigate();
  const { templates, isLoading, fetchTemplates, deleteTemplate, duplicateTemplate } = useTemplateStore();
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const handlePreview = (template) => {
    setCurrentTemplate(template);
    setShowPreviewModal(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
    }
  };
  
  const handleDuplicate = async (id) => {
    await duplicateTemplate(id);
  };
  
  const renderEmail = (blocks) => {
    return blocks.map((block) => {
      if (block.type === 'text') {
        return <div key={block.id} dangerouslySetInnerHTML={{ __html: block.content }} className="mb-4" />;
      } else if (block.type === 'image') {
        return <img key={block.id} src={block.content} alt={block.alt} className="max-w-full h-auto mb-4 rounded" />;
      } else if (block.type === 'button') {
        return (
          <div key={block.id} className="mb-4">
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
        return <hr key={block.id} className="my-4" style={{ borderColor: block.color || '#e5e7eb' }} />;
      } else if (block.type === 'spacer') {
        return <div key={block.id} style={{ height: `${block.height || 20}px` }} />;
      }
      return null;
    });
  };
  
  return (
    <DashboardLayout title="Templates">
      <Card
        title="Email Templates"
        subtitle={`${templates.length} templates created`}
        headerAction={
          <Button onClick={() => setShowCreateModal(true)}>
            Create Template
          </Button>
        }
      >
        {isLoading ? (
          <Loader />
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No templates yet</p>
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Template</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{template.subject}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handlePreview(template)}
                      icon={<Eye className="w-3 h-3" />}
                    >
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => navigate(`/dashboard/templates/${template.id}`)}
                      icon={<Edit className="w-3 h-3" />}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDuplicate(template.id)}
                      icon={<Copy className="w-3 h-3" />}
                    >
                      Duplicate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(template.id)}
                      icon={<Trash2 className="w-3 h-3" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Preview Modal */}
      {currentTemplate && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title="Template Preview"
          size="lg"
        >
          <div className="bg-slate-50 p-6 rounded-lg">
            <div className="bg-white p-8 rounded shadow-sm max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">{currentTemplate.subject}</h2>
              {renderEmail(currentTemplate.schema.blocks)}
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Templates;
