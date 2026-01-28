import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

const app = express();
app.get('/ping', (req, res) => res.send('pong'));

describe('Supertest Isolation', () => {
    it('should ping', async () => {
        const res = await request(app).get('/ping');
        expect(res.text).toBe('pong');
    });
});
