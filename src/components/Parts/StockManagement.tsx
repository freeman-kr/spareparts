import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';
import { Part } from '@/types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: Part;
  onSuccess: () => void;
}

export function StockAdjustmentModal({ isOpen, onClose, part, onSuccess }: StockAdjustmentModalProps) {
  const { t } = useTranslation('common');
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState<'increase' | 'decrease'>('increase');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newStock = type === 'increase' 
        ? part.current_stock + quantity
        : part.current_stock - quantity;

      const { error } = await supabase
        .from('parts')
        .update({ current_stock: newStock })
        .eq('id', part.id);

      if (error) throw error;

      // 재고 이력 저장
      await supabase.from('stock_history').insert({
        part_id: part.id,
        quantity: type === 'increase' ? quantity : -quantity,
        type: type.toUpperCase(),
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert(t('stock_adjustment_failed'));
    } finally {
      setLoading(false);
    }
  };

  // Modal UI 구현
} 