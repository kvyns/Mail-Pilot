import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useUserStore } from '../../store/userStore';
import { parseCSV } from '../../utils/csvParser';
import { parseExcel } from '../../utils/excelParser';

const Users = () => {
  const { users, isLoading, fetchUsers, addUser, deleteUser, importUsers, filters, setFilters } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSearch = (e) => {
    setFilters({ search: e.target.value });
  };
  
  const handleAddUser = async () => {
    const result = await addUser(newUser);
    if (result.success) {
      setShowAddModal(false);
      setNewUser({ name: '', email: '' });
    }
  };
  
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    
    try {
      let data;
      if (file.name.endsWith('.csv')) {
        data = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcel(file);
      }
      
      setImportPreview(data.slice(0, 5)); // Show first 5 rows
    } catch (error) {
      alert('Error parsing file: ' + error.message);
    }
  };
  
  const handleImport = async () => {
    if (!importFile) return;
    
    const result = await importUsers(importFile);
    if (result.success) {
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview(null);
      alert(result.data.message);
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
    }
  };
  
  return (
    <DashboardLayout title="Users">
      <Card
        title="User Management"
        subtitle={`${users.length} total users`}
        headerAction={
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
              Import CSV/Excel
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              Add User
            </Button>
          </div>
        }
      >
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        
        {/* Users Table */}
        {isLoading ? (
          <Loader />
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No users found</p>
            <Button onClick={() => setShowAddModal(true)}>Add Your First User</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
        </div>
      </Modal>
      
      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Users"
        size="lg"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={!importFile}>Import</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV or Excel File
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {importPreview && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows):</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(importPreview[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-medium text-gray-700">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {importPreview.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-2 text-gray-600">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Users;
