import { Request, Response } from 'express';

export class ProfileController {
  async getProfile(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user.userId;
    // TODO: Obtener usuario de la base de datos
    return res.json({
      status: 'ok',
      data: {
        id: userId,
        email: 'admin@zenda.com',
        fullName: 'Admin Zenda',
        role: 'admin',
        preferences: {
          currency: 'USD',
          language: 'es',
          theme: 'light'
        }
      }
    });
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { fullName, preferences } = req.body;
      const userId = (req as any).user.userId;
      
      // TODO: Actualizar usuario en la base de datos
      console.log(`📝 Actualizando perfil de usuario ${userId}`);
      console.log(`   Nombre: ${fullName}`);
      console.log(`   Preferencias: ${JSON.stringify(preferences)}`);
      
      // Simular actualización exitosa
      return res.json({
        status: 'ok',
        message: 'Perfil actualizado exitosamente',
        data: {
          id: userId,
          fullName: fullName || 'Admin Zenda',
          preferences: preferences || {
            currency: 'USD',
            language: 'es',
            theme: 'light'
          }
        }
      });
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
