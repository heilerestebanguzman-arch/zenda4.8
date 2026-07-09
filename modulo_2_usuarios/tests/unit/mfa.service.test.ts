import { MfaService } from '../../src/services/mfa.service';

describe('MfaService', () => {
  let mfaService: MfaService;

  beforeEach(() => {
    mfaService = new MfaService();
  });

  describe('generateSecret', () => {
    it('should generate a valid TOTP secret', () => {
      const secret = mfaService.generateSecret('admin@zenda.com');
      expect(secret).toBeDefined();
      expect(secret).toMatch(/^[A-Z2-7]{16,32}$/);
    });
  });

  describe('verifyToken', () => {
    it('should return true for valid TOTP code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const validCode = mfaService.generateCode(secret);
      const result = mfaService.verifyToken(secret, validCode);
      expect(result).toBe(true);
    });

    it('should return false for invalid TOTP code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const result = mfaService.verifyToken(secret, '123456');
      expect(result).toBe(false);
    });
  });
});
