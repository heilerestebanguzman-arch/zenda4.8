import { describe, test, expect } from '@jest/globals';
import { PublicHandler } from '../../../ports/http/handlers';

describe('PublicHandler', () => {
  test('debe existir', () => {
    expect(PublicHandler).toBeDefined();
  });
});
