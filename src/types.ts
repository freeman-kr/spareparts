export interface Part {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  current_stock: number;
  minimum_stock: number;
}

export interface StockRequest {
  id: string;
  part_id: string;
  requester_id: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  request_type: 'USAGE' | 'PURCHASE';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  active: boolean;
  created_at: string;
}

export interface StockHistory {
  id: string;
  part_id: string;
  quantity: number;
  type: 'INCREASE' | 'DECREASE';
  created_by: string;
  created_at: string;
  parts?: Part;
  users?: User;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  users?: User;
}

export interface StockAlert {
  id: string;
  part_id: string;
  threshold: number;
  enabled: boolean;
  created_at: string;
  parts?: Part;
} 