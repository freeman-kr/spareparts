import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';
import { StockRequest } from '@/types';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request: {
    id: string;
    part_id: string;
    requester_id: string;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    request_type: 'USAGE' | 'PURCHASE';
    parts: {
      code: string;
      name: string;
      current_stock: number;
    };
    users: {
      name: string;
    };
  };
  userRole: string;
}

export default function RequestDetailsModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  request, 
  userRole 
}: RequestDetailsModalProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stock_requests')
        .update({ status: action })
        .eq('id', request.id);

      if (error) throw error;

      if (action === 'approved') {
        const newStock = request.request_type === 'PURCHASE'
          ? request.parts.current_stock + request.quantity
          : request.parts.current_stock - request.quantity;

        const { error: stockError } = await supabase
          .from('parts')
          .update({ current_stock: newStock })
          .eq('id', request.part_id);

        if (stockError) throw stockError;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-6">{t('request_details')}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-500">{t('part')}:</span>
              <p className="text-gray-900">{request.parts.code} - {request.parts.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">{t('quantity')}:</span>
              <p className="text-gray-900">{request.quantity}</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-500">{t('requester')}:</span>
            <p className="text-gray-900">{request.users.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">{t('status')}:</span>
            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {t(request.status)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-500">{t('request_type')}:</span>
            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              request.request_type === 'PURCHASE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {t(request.request_type.toLowerCase())}
            </span>
          </div>
        </div>

        {userRole === 'admin' && request.status === 'pending' && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => handleAction('rejected')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              {t('reject')}
            </button>
            <button
              onClick={() => handleAction('approved')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            >
              {t('approve')}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}