export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'RECHARGE' | 'PAYMENT' | 'TRANSFER' | 'REFUND';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: Date;
}
