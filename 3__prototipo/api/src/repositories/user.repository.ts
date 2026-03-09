import { postgresPool } from "../infra/postgres.js";

export type UserRecord = {
  userId: string;
  email: string;
  name: string;
};

export class UserRepository {
  async findByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserRecord | null> {
    const result = await postgresPool.query(
      `
      SELECT
        user_id,
        email,
        name
      FROM users
      WHERE email = $1
      AND password = crypt($2, password)
      `,
      [email, password],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      userId: row.user_id,
      email: row.email,
      name: row.name,
    };
  }
}