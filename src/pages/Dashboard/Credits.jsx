import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useCreditStore } from '../../store/creditStore';
import Loader from '../../components/common/Loader';
import { CreditCard } from 'lucide-react';

const Credits = () => {
  const { balance, used, total, history, isLoading, fetchBalance, fetchHistory, purchaseCredits } = useCreditStore();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(1000);
  
  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);
  
  const creditPackages = [
    { amount: 1000, price: 10, label: 'Starter' },
    { amount: 5000, price: 45, label: 'Professional', popular: true },
    { amount: 10000, price: 80, label: 'Business' },
    { amount: 50000, price: 350, label: 'Enterprise' },
  ];
  
  const handlePurchase = async () => {
    const result = await purchaseCredits(purchaseAmount);
    if (result.success) {
      setShowPurchaseModal(false);
      alert(`Successfully purchased ${purchaseAmount} credits!`);
    }
  };
  
  return (
    <DashboardLayout title="Credits">
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-linear-to-br from-primary-500 to-primary-700 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">Available Credits</p>
            <p className="text-4xl font-bold mb-2">{balance.toLocaleString()}</p>
            <Button variant="secondary" size="sm" onClick={() => setShowPurchaseModal(true)}>
              Purchase Credits
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Credits Used</p>
            <p className="text-3xl font-bold text-gray-900">{used.toLocaleString()}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Purchased</p>
            <p className="text-3xl font-bold text-gray-900">{total.toLocaleString()}</p>
          </div>
        </Card>
      </div>
      
      <Card title="Credit Packages" subtitle="Choose the package that fits your needs">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.amount}
              className={`border-2 rounded-lg p-6 text-center transition-all hover:shadow-lg ${
                pkg.popular ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
              }`}
            >
              {pkg.popular && (
                <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full mb-2">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.label}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">${pkg.price}</p>
              <p className="text-sm text-gray-600 mb-4">{pkg.amount.toLocaleString()} credits</p>
              <Button 
                fullWidth 
                variant={pkg.popular ? 'primary' : 'outline'}
                onClick={() => {
                  setPurchaseAmount(pkg.amount);
                  setShowPurchaseModal(true);
                }}
              >
                Purchase
              </Button>
            </div>
          ))}
        </div>
      </Card>
      
      <Card title="Transaction History" subtitle="Your credit usage and purchases" className="mt-6">
        {isLoading ? (
          <Loader />
        ) : history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transaction history</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'purchase' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium text-right ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Purchase Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Purchase Credits"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowPurchaseModal(false)}>Cancel</Button>
            <Button onClick={handlePurchase}>Complete Purchase</Button>
          </div>
        }
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {purchaseAmount.toLocaleString()} Credits
          </h3>
          <p className="text-3xl font-bold text-primary-600 mb-6">
            ${(purchaseAmount / 100).toFixed(2)}
          </p>
          <p className="text-slate-600">
            This is a demo purchase. In production, this would integrate with a payment processor like Stripe.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Credits;
