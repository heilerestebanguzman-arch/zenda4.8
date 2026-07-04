import { pool } from '../../config/database';
import type { Wallet, WalletBalance } from '../../domain/wallet';
import type { Transaction } from '../../domain/transaction';

export class PublicRepository {
  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    const result = await pool.query(
      'SELECT id, user_id, balance, currency, status, created_at, updated_at FROM wallets WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async getWalletBalance(walletId: string): Promise<WalletBalance | null> {
    const result = await pool.query(
      'SELECT id as wallet_id, user_id, balance, currency, status FROM wallets WHERE id = $1',
      [walletId]
    );
    return result.rows[0] || null;
  }

  async getTransactionsByWalletId(walletId: string, limit: number = 10, offset: number = 0): Promise<Transaction[]> {
    const result = await pool.query(
      `SELECT id, wallet_id, type, amount, balance_before, balance_after, description, reference_id, status, created_at
       FROM transactions
       WHERE wallet_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [walletId, limit, offset]
    );
    return result.rows;
  }

  async getRoutes(): Promise<any[]> {
    const result = await pool.query(
      'SELECT id, name, description, start_location, end_location FROM routes WHERE active = true'
    );
    return result.rows;
  }

  async getBuses(): Promise<any[]> {
    const result = await pool.query(
      'SELECT id, plate, model, capacity, status FROM buses WHERE status = $1',
      ['ACTIVE']
    );
    return result.rows;
  }
}
