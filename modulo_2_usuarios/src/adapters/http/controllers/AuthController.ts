import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../core/use-cases/RegisterUser';
import { AuthenticateUserUseCase } from '../../../core/use-cases/AuthenticateUser';
import { RegisterSchema, LoginSchema } from '../../../core/validations/AuthValidation';
import { DomainError } from '../../../core/errors/DomainErrors';

export class AuthController {
  constructor(
    private registerUser: RegisterUserUseCase,
    private authenticateUser: AuthenticateUserUseCase
  ) {}

  async register(req: Request, res: Response) {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const user = await this.registerUser.execute(validatedData);
      return res.status(201).json({ status: 'ok', user });
    } catch (error: any) {
      if (error instanceof DomainError) {
        return res.status(400).json({ status: 'error', code: error.code, message: error.message });
      }
      if (error.issues) {
        return res.status(400).json({ status: 'error', message: 'Datos inválidos', details: error.issues });
      }
      console.error(error);
      return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await this.authenticateUser.execute(validatedData.email, validatedData.password);
      return res.status(200).json({ status: 'ok', ...result });
    } catch (error: any) {
      if (error instanceof DomainError) {
        return res.status(401).json({ status: 'error', code: error.code, message: error.message });
      }
      if (error.issues) {
        return res.status(400).json({ status: 'error', message: 'Datos inválidos', details: error.issues });
      }
      console.error(error);
      return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
  }
}
