import { postgresPool } from "../infra/postgres.js";

export type UserBankAccountRecord = {
  accountId: string;
  userId: string;
  bankName: string;
  bankUserId: string;
  status: string;
};

export class UserBankAccountRepository {
  async findActiveByUserId(userId: string): Promise<UserBankAccountRecord[]> {
    const result = await postgresPool.query(
      `
      SELECT
        account_id,
        user_id,
        bank_name,
        bank_user_id,
        status
      FROM user_bank_accounts
      WHERE user_id = $1
      AND status = 'active'
      `,
      [userId],
    );

    return result.rows.map((row) => ({
      accountId: row.account_id,
      userId: row.user_id,
      bankName: row.bank_name,
      bankUserId: row.bank_user_id,
      status: row.status,
    }));
  }
}