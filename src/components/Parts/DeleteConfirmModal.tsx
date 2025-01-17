import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';
import { Part } from '@/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  part: Part;
}

export default function DeleteConfirmModal({ isOpen, onClose, onSuccess, part }: DeleteConfirmModalProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('id', part.id);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting part:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">{t('delete_part')}</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-gray-700 mb-4">
            {t('delete_part_confirm_message')}
          </p>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-500">{t('code')}:</span>
                <span className="ml-2 text-gray-900">{part.code}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">{t('name')}:</span>
                <span className="ml-2 text-gray-900">{part.name}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-500">{t('category')}:</span>
                <span className="ml-2 text-gray-900">{part.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">{t('current_stock')}:</span>
                <span className="ml-2 text-gray-900">{part.current_stock}</span>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-500">{t('location')}:</span>
              <span className="ml-2 text-gray-900">{part.location || '-'}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            {loading ? t('deleting') : t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
} 