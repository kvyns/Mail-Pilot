import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentAPI } from '../../api/payment.api';
import Button from '../../components/common/Button';

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'pending' | 'error'
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('No session ID found in URL.');
      return;
    }

    const retrieve = async () => {
      try {
        const response = await paymentAPI.retrieveSession(sessionId);
        const data = response?.data || response;
        setSession(data);

        const paymentStatus = data?.payment_status || data?.paymentStatus || data?.status;
        if (paymentStatus === 'paid') {
          setStatus('success');
        } else {
          // Stripe may report 'unpaid' briefly — webhook will update asynchronously
          setStatus('pending');
        }
      } catch (err) {
        setError(err?.message || 'Failed to retrieve payment session.');
        setStatus('error');
      }
    };

    retrieve();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Verifying payment…</h2>
            <p className="text-gray-500 mt-2 text-sm">Please wait while we confirm your transaction.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-2">
              Your credits have been added to your account.
            </p>
            {session?.amount_total && (
              <p className="text-primary-600 font-semibold text-lg mb-4">
                ${(session.amount_total / 100).toFixed(2)} paid
              </p>
            )}
            <div className="flex flex-col gap-3 mt-6">
              <Link to="/dashboard/credits">
                <Button fullWidth>View My Credits</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" fullWidth>Go to Dashboard</Button>
              </Link>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Received</h2>
            <p className="text-gray-600 mb-4">
              Your payment is being processed. Credits will be added to your account shortly.
            </p>
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/dashboard/credits">
                <Button fullWidth>View My Credits</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" fullWidth>Go to Dashboard</Button>
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/dashboard/credits">
                <Button fullWidth>Back to Credits</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Confirmation;
