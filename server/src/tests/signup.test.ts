import {describe, expect, test, it, vi, beforeEach} from 'vitest';
import request from "supertest";
import { app } from "../index"
import { prismaClient } from '../__mocks__/db'
import bcrypt from 'bcrypt';

vi.mock('../db'); 

describe("POST /api/v1/signup", () => {
    // beforeEach(() => {
    //     vi.resetAllMocks();
    // })

    it("should create the user data", async() => {
        const plainTextPassword = '12345678';
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

        prismaClient.user.create.mockResolvedValue({
            id: 1,
            name: 'Luke Skywalker',
            email: 'lukeskywalker@gmail.com',
            password: hashedPassword
        });

        const res = await request(app).post('/api/v1/signup').send({
            name: 'Luke Skywalker',
            email: 'lukeskywalker@gmail.com',
            password: plainTextPassword
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('name', 'Luke Skywalker');
        expect(res.body.data).toHaveProperty('email', 'lukeskywalker@gmail.com');

        const isPasswordValid = await bcrypt.compare(plainTextPassword, res.body.data.password);
        expect(isPasswordValid).toBe(true);
    });

    it("should return error for invalid inputs", async() => {
        const res = await request(app).post('/api/v1/signup').send({
            name: 'luke',
            email: 'invalid-email',
            password: '123'
        });

        expect(res.statusCode).toBe(411)
        expect(res.body).toHaveProperty('error');
    });
})