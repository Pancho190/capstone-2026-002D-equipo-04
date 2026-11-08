const request = require('supertest');
const app = require('../server');

describe('Auth', () => {
  it('debería registrar un usuario', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      email: 'test2@duoc.cl',
      password: '123456',
      nombre: 'Test2',
      rut: '99.999.999-9'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Usuario creado exitosamente');
  });

  it('debería rechazar registro duplicado', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      email: 'test2@duoc.cl',
      password: '123456',
      nombre: 'Test2',
      rut: '99.999.999-9'
    });
    expect(res.statusCode).toBe(400);
  });

  it('debería hacer login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test2@duoc.cl',
      password: '123456'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});