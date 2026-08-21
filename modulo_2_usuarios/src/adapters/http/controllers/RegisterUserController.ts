import { Request, Response } from 'express';
import { RegisterUser } from '../../../core/use-cases/RegisterUser';

export class RegisterUserController {
  constructor(private registerUser: RegisterUser) {}

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, fullName, role, phone, documentId } = req.body;

      // Validación básica
      if (!email || !password || !fullName || !role) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos obligatorios: email, password, fullName, role',
        });
      }

      // Ejecutar el caso de uso
      const user = await this.registerUser.execute({
        email,
        password,
        fullName,
        role,
        phone,
        documentId,
      });

      // No devolver la contraseña hasheada
      const { passwordHash, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Error al registrar usuario',
      });
    }
  }
}
