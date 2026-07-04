export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  created_at: Date;
  updated_at: Date;
}

export interface WalletBalance {
  wallet_id: string;
  user_id: string;
  balance: number;
  currency: string;
  status: string;
}
