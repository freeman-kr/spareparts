export interface User {
  id: string;
  email: string;
  role: 'admin' | 'parts_manager' | 'maintenance' | 'purchasing';
  name: string;
  active: boolean;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  location: string;
  last_updated: Date;
}

export interface StockRequest {
  id: string;
  part_id: string;
  requester_id: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
} 