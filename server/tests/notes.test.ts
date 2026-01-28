import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';

describe('Notes API', () => {
    let authToken: string;
    let userId: string;
    let noteId: string;

    beforeAll(async () => {
        console.log('Starting beforeAll...');
        try {
            // Clean up
            console.log('Cleaning up DB...');
            await prisma.note.deleteMany();
            await prisma.user.deleteMany();

            // Create test user and get token
            console.log('Creating test user...');
            const signupRes = await request(app).post('/auth/signup').send({
                email: 'notetest@example.com',
                password: 'password123',
                displayName: 'Note Tester',
            });
            console.log('Signup response:', signupRes.status, signupRes.body);

            authToken = signupRes.body.token;
            userId = signupRes.body.user.id;
        } catch (e) {
            console.error('Error in beforeAll:', e);
            throw e;
        }
    });

    afterAll(async () => {
        await prisma.note.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it('should setup correctly', () => {
        expect(authToken).toBeDefined();
        expect(userId).toBeDefined();
    });
    /*

    it('should create a new note', async () => {
        const res = await request(app)
            .post('/notes')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Test Note',
                content: '## Hello World',
                tags: ['test', 'demo'],
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Note');
        expect(res.body.tags).toEqual(['test', 'demo']);
        noteId = res.body.id;
    });

    it('should get all notes', async () => {
        const res = await request(app)
            .get('/notes')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get a note by id', async () => {
        const res = await request(app)
            .get(`/notes/${noteId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(noteId);
    });

    it('should update a note', async () => {
        const res = await request(app)
            .put(`/notes/${noteId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Updated Note',
                isPinned: true,
            });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Note');
        expect(res.body.isPinned).toBe(true);
    });

    it('should search notes by query', async () => {
        const res = await request(app)
            .get('/notes?q=Updated')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should delete a note', async () => {
        const res = await request(app)
            .delete(`/notes/${noteId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Note deleted successfully');
    });

    it('should return 404 for non-existent note', async () => {
        const res = await request(app)
            .get(`/notes/${noteId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
    });

    it('should require authentication', async () => {
        const res = await request(app).get('/notes');
        expect(res.status).toBe(401);
    });
    */
});
