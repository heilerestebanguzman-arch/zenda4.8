import { Request, Response } from 'express';
import { PasswordValidator } from '../../../core/services/PasswordValidator';

export class UserController {
  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      // TODO: Implementar listado de usuarios
      return res.json({
        message: 'Listado de usuarios',
        users: []
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      // TODO: Implementar obtención de usuario por ID
      return res.json({
        message: `Usuario con ID: ${id}`,
        user: null
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, fullName, role } = req.body;

      // Validar contraseña
      const validation = PasswordValidator.validate(password);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Contraseña inválida',
          details: validation.errors
        });
      }

      // TODO: Implementar creación de usuario en BD
      const user = {
        id: "temp-id",
        email,
        fullName,
        role,
        // NO incluir passwordHash
      };

      return res.status(201).json({
        message: 'User created',
        data: user
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userData = req.body;
      // TODO: Implementar actualización de usuario
      return res.json({
        message: `Usuario ${id} actualizado`,
        data: userData
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      // TODO: Implementar eliminación de usuario
      return res.json({
        message: `Usuario ${id} eliminado`
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
