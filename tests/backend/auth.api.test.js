import request from 'supertest';
import app from '../../backend/src/index.js';
import { activeTokens } from '../../backend/src/routes/auth.js';

beforeEach(() => {
  activeTokens.clear();
  process.env.ADMIN_PASSWORD = "admin123";
});

describe('Auth API', () => {
  it('POST /api/auth/login returns 200 and token for correct password', async () => {
    const response = await request(app).post('/api/auth/login').send({ password: 'admin123' });
    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login returns 401 for wrong password', async () => {
    const response = await request(app).post('/api/auth/login').send({ password: 'wrongpassword' });
    expect(response.status).toBe(401);
  });

  it('token is added to activeTokens Set after successful login', async () => {
    const response = await request(app).post('/api/auth/login').send({ password: 'admin123' });
    expect(activeTokens.has(response.body.token)).toBe(true);
  });
});
