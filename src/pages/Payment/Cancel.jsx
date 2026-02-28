import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const Cancel = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled and you have not been charged. You can purchase credits at any time.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard/credits">
            <Button fullWidth>Back to Credits</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" fullWidth>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cancel;
