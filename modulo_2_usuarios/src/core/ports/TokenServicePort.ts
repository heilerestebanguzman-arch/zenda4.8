export interface TokenServicePort {
  generateAccessToken(payload: { userId: string; email: string; role: string }): string;
  generateRefreshToken(payload: { userId: string; email: string }): string;
  verifyAccessToken(token: string): { userId: string; email: string; role: string } | null;
  verifyRefreshToken(token: string): { userId: string; email: string } | null;
}
