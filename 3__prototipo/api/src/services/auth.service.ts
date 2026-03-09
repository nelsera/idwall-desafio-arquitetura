import jwt from "jsonwebtoken";

import { UserRepository } from "../repositories/user.repository.js";

type LoginInput = {
  email: string;
  password: string;
};

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmailAndPassword(
      input.email,
      input.password,
    );

    if (!user) {
      return null;
    }

    const secret = process.env.JWT_SECRET ?? "dev-secret";

    const token = jwt.sign(
      {
        sub: user.userId,
        email: user.email,
        name: user.name,
      },
      secret,
      { expiresIn: "1h" },
    );

    return {
      accessToken: token,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
      },
    };
  }
}