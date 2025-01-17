import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';
import { Part } from '@/types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function CreateRequestModal({ isOpen, onClose, onSuccess, userId }: CreateRequestModalProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [formData, setFormData] = useState({
    part_id: '',
    quantity: 1,
    request_type: 'USAGE' as 'USAGE' | 'PURCHASE'
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('name');

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('stock_requests')
        .insert([{
          part_id: formData.part_id,
          quantity: formData.quantity,
          requester_id: userId,
          status: 'pending',
          request_type: formData.request_type
        }]);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-6">{t('create_request')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('request_type')}
            </label>
            <select
              required
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value as 'USAGE' | 'PURCHASE' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="USAGE">{t('usage')}</option>
              <option value="PURCHASE">{t('purchase')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('part')}
            </label>
            <select
              required
              value={formData.part_id}
              onChange={(e) => setFormData({ ...formData, part_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">{t('select_part')}</option>
              {parts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.code} - {part.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('quantity')}
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t('enter_quantity') || ''}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 