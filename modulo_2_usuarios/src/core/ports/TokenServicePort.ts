export interface TokenServicePort {
  generate(userId: string, email: string, role: string): Promise<string>;
  verify(token: string): Promise<{ userId: string; email: string; role: string } | null>;
}
