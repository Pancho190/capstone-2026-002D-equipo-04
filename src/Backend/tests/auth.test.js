const request = require('supertest');
const app = require('../server');

const uid = Date.now().toString().slice(-8);
const TEST_EMAIL = `test_${uid}@duoc.cl`;
const TEST_RUT = `${uid.slice(0, 2)}.${uid.slice(2, 5)}.${uid.slice(5, 8)}-9`;

describe('Auth', () => {
  it('debería registrar un usuario', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      email: TEST_EMAIL,
      password: '123456',
      nombre: 'Test2',
      rut: TEST_RUT
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Usuario creado exitosamente');
  });

  it('debería rechazar registro duplicado', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      email: TEST_EMAIL,
      password: '123456',
      nombre: 'Test2',
      rut: TEST_RUT
    });
    expect(res.statusCode).toBe(400);
  });

  it('debería hacer login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: '123456'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});