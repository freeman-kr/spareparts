import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/Layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { StockRequest } from '@/types';
import CreateRequestModal from '@/components/Requests/CreateRequestModal';
import RequestDetailsModal from '@/components/Requests/RequestDetailsModal';

interface RequestWithPart extends StockRequest {
  parts: {
    code: string;
    name: string;
    current_stock: number;
  };
  users: {
    name: string;
  };
}

export default function Requests() {
  const { t } = useTranslation('common');
  const [requests, setRequests] = useState<RequestWithPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithPart | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    fetchRequests();
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data) {
          setUserRole(data.role);
        }
      }
    };
    getCurrentUser();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_requests')
        .select(`
          *,
          parts:part_id(name, code),
          users:requester_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (request: RequestWithPart) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{t('requests')}</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            {t('new_request')}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('part')}
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('requester')}
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quantity')}
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('requested_at')}
                </th>
                <th className="px-6 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.parts.code} - {request.parts.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.users.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {t(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleViewDetails(request)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {t('view_details')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentUser && (
          <CreateRequestModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={fetchRequests}
            userId={currentUser}
          />
        )}

        {selectedRequest && (
          <RequestDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            onSuccess={fetchRequests}
            request={selectedRequest}
            userRole={userRole}
          />
        )}
      </div>
    </MainLayout>
  );
} 