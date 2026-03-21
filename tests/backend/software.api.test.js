import request from 'supertest';
import app from '../../backend/src/index.js';
import { activeTokens } from '../../backend/src/routes/auth.js';
import { resetSoftwareStore } from '../../backend/src/softwareStore.js';

beforeEach(() => {
  resetSoftwareStore();
  activeTokens.clear();
});

describe('Software API', () => {
  it('GET /api/software returns 200 and array with 6 items', async () => {
    const response = await request(app).get('/api/software');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(6);
  });

  it('GET /api/categories returns 200 and non-empty string array', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('POST /api/software without auth token returns 401', async () => {
    const response = await request(app).post('/api/software').send({ name: 'TestApp', url: 'https://example.com' });
    expect(response.status).toBe(401);
  });

  it('POST /api/software with valid Bearer token returns 201 with correct shape', async () => {
    const token = 'test-valid-token';
    activeTokens.add(token);
    const response = await request(app)
      .post('/api/software')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'TestApp', description: 'A test', version: '1.0', category: 'Utilities', url: 'https://example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'TestApp');
    expect(response.body).toHaveProperty('url', 'https://example.com');
    expect(response.body).toHaveProperty('createdAt');
  });

  it('POST /api/software with auth but missing name returns 400', async () => {
    const token = 'test-valid-token';
    activeTokens.add(token);
    const response = await request(app)
      .post('/api/software')
      .set('Authorization', `Bearer ${token}`)
      .send({ version: '1.0', category: 'Utilities', url: 'https://example.com' });

    expect(response.status).toBe(400);
  });

  it('DELETE /api/software/:id without auth returns 401', async () => {
    const response = await request(app).delete('/api/software/1');
    expect(response.status).toBe(401);
  });

  it('DELETE /api/software/:id with auth and valid id returns 200', async () => {
    const token = 'test-valid-token';
    activeTokens.add(token);
    const response = await request(app)
      .delete('/api/software/1')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it('DELETE /api/software/:id with auth and invalid id returns 404', async () => {
    const token = 'test-valid-token';
    activeTokens.add(token);
    const response = await request(app)
      .delete('/api/software/9999')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
  });
});
