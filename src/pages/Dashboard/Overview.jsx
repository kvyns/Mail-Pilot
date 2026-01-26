import React, { useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { useCreditStore } from '../../store/creditStore';
import { useCampaignStore } from '../../store/campaignStore';
import { useUserStore } from '../../store/userStore';
import Loader from '../../components/common/Loader';
import { CreditCard, Mail, Users, BarChart3, FileText } from 'lucide-react';

const Overview = () => {
  const { balance, used, fetchBalance } = useCreditStore();
  const { campaigns, stats, fetchCampaigns, fetchStats } = useCampaignStore();
  const { users, fetchUsers } = useUserStore();
  
  const [loading, setLoading] = React.useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchBalance(),
        fetchCampaigns(),
        fetchStats(),
        fetchUsers(),
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  if (loading) {
    return (
      <DashboardLayout title="Overview">
        <Loader fullScreen text="Loading dashboard..." />
      </DashboardLayout>
    );
  }
  
  const statCards = [
    {
      title: 'Available Credits',
      value: balance.toLocaleString(),
      icon: CreditCard,
      color: 'bg-blue-500',
      subtitle: `${used.toLocaleString()} credits used`,
    },
    {
      title: 'Total Campaigns',
      value: campaigns.length,
      icon: Mail,
      color: 'bg-green-500',
      subtitle: stats ? `${stats.sentCampaigns} sent` : 'N/A',
    },
    {
      title: 'Total Users',
      value: users.length.toLocaleString(),
      icon: Users,
      color: 'bg-indigo-500',
      subtitle: 'Active contacts',
    },
    {
      title: 'Avg Open Rate',
      value: stats ? `${stats.avgOpenRate}%` : 'N/A',
      icon: BarChart3,
      color: 'bg-purple-500',
      subtitle: 'Campaign performance',
    },
  ];
  
  const recentCampaigns = campaigns.slice(0, 5);
  
  return (
    <DashboardLayout title="Overview">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card title="Recent Campaigns" subtitle="Latest campaign activity">
          {recentCampaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No campaigns yet</p>
          ) : (
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{campaign.name}</h4>
                    <p className="text-sm text-slate-600">{campaign.subject}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span>{campaign.recipientsCount} recipients</span>
                      {campaign.status === 'sent' && (
                        <span>{campaign.openRate}% open rate</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    `}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        {/* Quick Actions */}
        <Card title="Quick Actions" subtitle="Common tasks">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/campaigns'}
              className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-slate-900">New Campaign</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard/templates'}
              className="p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-600 transition-colors">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-slate-900">New Template</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard/users'}
              className="p-6 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-center group"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 transition-colors">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-slate-900">Import Users</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard/credits'}
              className="p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center group"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-600 transition-colors">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-slate-900">Buy Credits</div>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
