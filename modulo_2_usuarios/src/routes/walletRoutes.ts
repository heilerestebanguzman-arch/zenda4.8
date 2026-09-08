import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { Pool } from 'pg';
import crypto from 'crypto';

const router = express.Router();

// Configuración de la base de datos
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'zenda_admin',
  password: 'zenda_secure_pass_2026',
  database: 'zenda',
});

// Generar ID de transacción único
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// Obtener saldo de la billetera
router.get('/driver/wallet/:userId', authMiddleware, async (req: any, res: any) => {
  const client = await pool.connect();
  try {
    const { userId } = req.params;

    // Consultar saldo y transacciones
    const balanceResult = await client.query(
      `SELECT balance, available, pending 
       FROM driver_wallets 
       WHERE user_id = $1`,
      [userId]
    );

    const transactionsResult = await client.query(
      `SELECT id, amount, type, description, status, created_at 
       FROM wallet_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    );

    const walletData = {
      balance: balanceResult.rows[0]?.balance || 0,
      available: balanceResult.rows[0]?.available || 0,
      pending: balanceResult.rows[0]?.pending || 0,
      todayEarnings: 12.00,
      weekEarnings: 45.50,
      monthEarnings: 45.50,
      tripsToday: 3,
      tripsWeek: 11,
      tripsMonth: 11,
      lastTransactions: transactionsResult.rows,
    };

    res.json({ success: true, data: walletData });
  } catch (error) {
    console.error('Error al obtener billetera:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos de billetera' });
  } finally {
    client.release();
  }
});

// ✅ SOLICITAR RETIRO CON ATOMICIDAD (BEGIN/COMMIT)
router.post('/driver/withdraw', authMiddleware, async (req: any, res: any) => {
  const client = await pool.connect();
  const transactionId = generateTransactionId();
  
  try {
    const { userId, amount, bankAccount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos de retiro inválidos' 
      });
    }

    // ✅ INICIAR TRANSACCIÓN ATÓMICA
    await client.query('BEGIN');

    // 1. BLOQUEAR FILA PARA EVITAR RACE CONDITIONS
    const lockResult = await client.query(
      `SELECT balance, available 
       FROM driver_wallets 
       WHERE user_id = $1 
       FOR UPDATE`,
      [userId]
    );

    if (lockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Billetera no encontrada' 
      });
    }

    const { balance, available } = lockResult.rows[0];

    if (available < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Saldo insuficiente para el retiro' 
      });
    }

    // 2. DESCONTAR SALDO
    await client.query(
      `UPDATE driver_wallets 
       SET available = available - $1,
           pending = pending + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [amount, userId]
    );

    // 3. REGISTRAR TRANSACCIÓN
    await client.query(
      `INSERT INTO wallet_transactions 
       (id, user_id, amount, type, description, status, reference, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        transactionId,
        userId,
        amount,
        'withdrawal',
        `Retiro a cuenta ${bankAccount || 'Bancaria'}`,
        'pending',
        `WTH-${Date.now()}`
      ]
    );

    // 4. REGISTRAR EN AUDITORÍA
    await client.query(
      `INSERT INTO audit_logs 
       (id, user_id, action, entity, entity_id, old_value, new_value, ip, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        `AUD-${Date.now()}`,
        userId,
        'withdrawal_request',
        'wallet',
        transactionId,
        JSON.stringify({ balance, available }),
        JSON.stringify({ balance: balance - amount, available: available - amount }),
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      ]
    );

    // ✅ CONFIRMAR TRANSACCIÓN
    await client.query('COMMIT');

    console.log(`💰 Retiro procesado: ${transactionId} - Usuario: ${userId} - Monto: Bs ${amount}`);

    res.json({
      success: true,
      message: 'Solicitud de retiro procesada exitosamente',
      withdrawalId: transactionId,
      amount: amount,
      status: 'pending',
    });

  } catch (error) {
    // ❌ REVERTIR TRANSACCIÓN EN CASO DE ERROR
    await client.query('ROLLBACK');
    console.error('Error en retiro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el retiro' 
    });
  } finally {
    client.release();
  }
});

export default router;
