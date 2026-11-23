const request = require('supertest');
const app = require('../server');

const ADMIN_EMAIL = 'admin@duoc.cl';
const ADMIN_PASSWORD = 'Admin123!';

const uid = Date.now().toString().slice(-8);
const TEST_RUT = `${uid.slice(0, 2)}.${uid.slice(2, 5)}.${uid.slice(5, 8)}-9`;

// Helper: login as admin and return token
async function loginAdmin() {
  const res = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  return res.body.token;
}

// Helper: create an event with wide time window (always active)
async function crearEvento(token, nombre = 'Evento Test') {
  const res = await request(app)
    .post('/api/eventos')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre,
      fecha_inicio: '2020-01-01T00:00',
      fecha_fin: '2030-12-31T23:59',
      ubicacion: 'Valparaíso',
      tipo: 'Japan'
    });
  return res.body.evento;
}

describe('Eventos - Eliminación', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAdmin();
  });

  it('debería eliminar un evento existente', async () => {
    const evento = await crearEvento(adminToken, 'Evento a eliminar');
    expect(evento).toBeDefined();
    expect(evento.id).toBeDefined();

    const res = await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toContain('eliminados');
  });

  it('debería retornar 404 al eliminar evento inexistente', async () => {
    const res = await request(app)
      .delete('/api/eventos/id-inexistente-123')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('debería rechazar eliminación sin token', async () => {
    const evento = await crearEvento(adminToken, 'Evento sin token');
    const res = await request(app).delete(`/api/eventos/${evento.id}`);
    expect(res.statusCode).toBe(401);

    // Cleanup
    await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  it('debería rechazar eliminación con rol no admin', async () => {
    // Register a captador
    const captadorEmail = `captador_${uid}@duoc.cl`;
    const captadorRut = `${uid.slice(0, 2)}.${uid.slice(2, 5)}.${uid.slice(5, 8)}-9`;
    await request(app).post('/api/auth/registro').send({
      email: captadorEmail,
      password: '123456',
      nombre: 'Captador Test',
      rut: captadorRut
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: captadorEmail,
      password: '123456'
    });
    const captadorToken = loginRes.body.token;

    const evento = await crearEvento(adminToken, 'Evento rol no admin');
    const res = await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${captadorToken}`);

    expect(res.statusCode).toBe(403);

    // Cleanup
    await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });
});

describe('Eventos - Eliminación con prospectos asociados', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAdmin();
  });

  it('debería eliminar evento y sus prospectos asociados', async () => {
    const evento = await crearEvento(adminToken, 'Evento con prospectos');
    expect(evento).toBeDefined();

    // Create a prospect associated with the event
    const prospectoRes = await request(app)
      .post('/api/prospectos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rut: TEST_RUT,
        nombre_completo: 'Prospecto Test',
        evento_id: evento.id
      });
    expect(prospectoRes.statusCode).toBe(201);

    // Verify prospect exists
    const inscritosBefore = await request(app)
      .get(`/api/prospectos/evento/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(inscritosBefore.body.data.length).toBeGreaterThan(0);

    // Delete the event
    const deleteRes = await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(200);

    // Verify event is gone
    const getRes = await request(app)
      .get(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.statusCode).toBe(404);

    // Verify prospects are gone
    const inscritosAfter = await request(app)
      .get(`/api/prospectos/evento/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(inscritosAfter.body.data.length).toBe(0);
  });
});

describe('Prospectos - Inscritos por evento', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAdmin();
  });

  it('debería listar inscritos de un evento', async () => {
    const evento = await crearEvento(adminToken, 'Evento inscritos');
    expect(evento).toBeDefined();

    // Create a prospect
    await request(app)
      .post('/api/prospectos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rut: TEST_RUT,
        nombre_completo: 'Prospecto Inscrito',
        evento_id: evento.id
      });

    const res = await request(app)
      .get(`/api/prospectos/evento/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);

    // Cleanup
    await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  it('debería retornar lista vacía para evento sin inscritos', async () => {
    const evento = await crearEvento(adminToken, 'Evento sin inscritos');

    const res = await request(app)
      .get(`/api/prospectos/evento/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(0);
    expect(res.body.total).toBe(0);

    // Cleanup
    await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });
});

describe('Eventos - Mis eventos (captador)', () => {
  let adminToken;
  let captadorToken;
  let captadorId;

  beforeAll(async () => {
    adminToken = await loginAdmin();

    // Register a captador
    const captadorEmail = `captador_mis_${uid}@duoc.cl`;
    const captadorRut = `${uid.slice(0, 2)}.${uid.slice(2, 5)}.${uid.slice(5, 8)}-8`;
    await request(app).post('/api/auth/registro').send({
      email: captadorEmail,
      password: '123456',
      nombre: 'Captador Mis Eventos',
      rut: captadorRut
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: captadorEmail,
      password: '123456'
    });
    captadorToken = loginRes.body.token;
    captadorId = loginRes.body.usuario?.id || loginRes.body.id;

    // Get captador user id from /api/auth/usuarios if needed
    if (!captadorId) {
      const usuariosRes = await request(app)
        .get('/api/auth/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);
      const captador = usuariosRes.body.find(u => u.correo === captadorEmail);
      captadorId = captador?.id;
    }
  });

  it('debería listar eventos asignados al captador', async () => {
    const evento = await crearEvento(adminToken, 'Evento asignado captador');
    expect(evento).toBeDefined();

    // Assign captador to event
    const assignRes = await request(app)
      .post(`/api/eventos/${evento.id}/asignar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ usuario_id: captadorId });
    expect(assignRes.statusCode).toBe(201);

    // Get mis eventos
    const res = await request(app)
      .get('/api/eventos/mis')
      .set('Authorization', `Bearer ${captadorToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some(e => e.id === evento.id)).toBe(true);

    // Cleanup
    await request(app)
      .delete(`/api/eventos/${evento.id}/asignar/${captadorId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/eventos/${evento.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  it('debería retornar lista vacía si no tiene eventos asignados', async () => {
    // Create a new captador with no assignments
    const newCaptadorEmail = `captador_empty_${uid}@duoc.cl`;
    const newCaptadorRut = `${uid.slice(0, 2)}.${uid.slice(2, 5)}.${uid.slice(5, 8)}-7`;
    await request(app).post('/api/auth/registro').send({
      email: newCaptadorEmail,
      password: '123456',
      nombre: 'Captador Sin Eventos',
      rut: newCaptadorRut
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: newCaptadorEmail,
      password: '123456'
    });
    const newToken = loginRes.body.token;

    const res = await request(app)
      .get('/api/eventos/mis')
      .set('Authorization', `Bearer ${newToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
