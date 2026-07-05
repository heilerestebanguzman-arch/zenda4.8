import { Request, Response } from 'express';

export class UserController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userData = req.body;
      // Crear usuario...
      const user = {
        id: "...",
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        // NO incluir passwordHash
      };
      return res.status(201).json({ message: 'User created', data: user });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
