import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { useCampaignStore } from '../../store/campaignStore';
import { useTemplateStore } from '../../store/templateStore';
import { useUserStore } from '../../store/userStore';
import { useCreditStore } from '../../store/creditStore';
import { Mail, BarChart3, MousePointer } from 'lucide-react';

const Campaigns = () => {
  const { campaigns, isLoading, fetchCampaigns, createCampaign, sendCampaign, deleteCampaign } = useCampaignStore();
  const { templates, fetchTemplates } = useTemplateStore();
  const { users, fetchUsers } = useUserStore();
  const { balance, deductCredits } = useCreditStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    templateId: '',
    recipientsCount: 0,
  });
  
  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchUsers();
  }, []);
  
  const handleCreate = async () => {
    const result = await createCampaign({
      ...newCampaign,
      recipientsCount: users.length,
    });
    
    if (result.success) {
      setShowCreateModal(false);
      setNewCampaign({ name: '', subject: '', templateId: '', recipientsCount: 0 });
    }
  };
  
  const handleSend = async (campaign) => {
    const creditsNeeded = campaign.recipientsCount;
    
    if (balance < creditsNeeded) {
      alert(`Insufficient credits. You need ${creditsNeeded} credits but only have ${balance}.`);
      return;
    }
    
    if (!confirm(`Send campaign to ${campaign.recipientsCount} recipients? This will use ${creditsNeeded} credits.`)) {
      return;
    }
    
    const result = await sendCampaign(campaign.id);
    if (result.success) {
      await deductCredits(creditsNeeded, `Campaign: ${campaign.name}`);
      alert('Campaign sent successfully!');
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm('Delete this campaign?')) {
      await deleteCampaign(id);
    }
  };
  
  return (
    <DashboardLayout title="Campaigns">
      <Card
        title="Email Campaigns"
        subtitle={`${campaigns.length} campaigns created`}
        headerAction={
          <Button onClick={() => setShowCreateModal(true)}>
            Create Campaign
          </Button>
        }
      >
        {isLoading ? (
          <Loader />
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No campaigns yet</p>
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Campaign</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                    <p className="text-slate-600">{campaign.subject}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-slate-600 mb-4">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {campaign.recipientsCount} recipients</span>
                  {campaign.status === 'sent' && (
                    <>
                      <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> {campaign.openRate}% open rate</span>
                      <span className="flex items-center gap-1.5"><MousePointer className="w-4 h-4" /> {campaign.clickRate}% click rate</span>
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {campaign.status === 'draft' && (
                    <Button size="sm" onClick={() => handleSend(campaign)}>
                      Send Campaign
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(campaign.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Campaign"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            value={newCampaign.name}
            onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            required
          />
          <Input
            label="Email Subject"
            value={newCampaign.subject}
            onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Template
            </label>
            <select
              value={newCampaign.templateId}
              onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-900">
              This campaign will be sent to {users.length} users and will cost {users.length} credits.
            </p>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Campaigns;
