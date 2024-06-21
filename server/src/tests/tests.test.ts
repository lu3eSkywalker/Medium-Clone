import {describe, expect, test, it, vi, beforeEach} from 'vitest';
import request from "supertest";
import { app } from "../index"
import { prismaClient } from '../__mocks__/db'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Category } from '@prisma/client';
import e from 'express';

vi.mock('../db');
vi.mock('../utils/cloudinary');

const secretjwt = 'medium'

describe('POST /api/v1/login', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    })


    it("should login successfully with valid credentials", async() => {
        const plainTextPassword = '12345678';
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

        prismaClient.user.findUnique.mockResolvedValue({
            id: 1,
            name: 'Luke Skywalker',
            email: 'lukeskywalker@gmail.com',
            password: hashedPassword
        });

        const res = await request(app).post('/api/v1/login').send({
            email: 'lukeskywalker@gmail.com',
            password: plainTextPassword,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('name', 'Luke Skywalker');
        expect(res.body.data).toHaveProperty('email', 'lukeskywalker@gmail.com')

        expect(res.body).toHaveProperty('token');

        const decodedToken = jwt.verify(res.body.token, secretjwt);
        expect(decodedToken).toHaveProperty('payload.email', 'lukeskywalker@gmail.com')

    });

    it('should return an error if the email is not registered', async() => {
        prismaClient.user.findUnique.mockResolvedValue(null);

        const res = await request(app).post('/api/v1/login').send({
            email: 'unknown@gmail.com',
            password: '12345678',
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not registered');
    });

    it('should return an error if the password is incorrect', async() => {
        const plainTextPassword = '12345678';
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

        prismaClient.user.findUnique.mockResolvedValue({
            id: 1,
            name: 'Luke Skywalker',
            email: 'lukeskywalker@gmail.com',
            password: hashedPassword
        });

        const res = await request(app).post('/api/v1/login').send({
            email: 'lukeskywalker@gmail.com',
            password: 'wrongpassword'
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Password Incorrect');
    });

    it("should return an error if the input data is invalid", async() => {
        const res = await request(app).post('/api/v1/login').send({
            email: 'invalid-email',
            password: '123'
        });

        expect(res.statusCode).toBe(411);
    })
})

describe('POST /api/v1/uploadblog', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });


    it("should upload the blog successfully", async () => {
        const token = jwt.sign({ id: 1, name: 'Luke Skywalker', email: 'lukeskywalker@gmail.com' }, secretjwt);


        prismaClient.blog.create.mockResolvedValue({
            id: 1,
            userId: 1,
            title: 'This is the blog title',
            body: 'This is the blog sample body...',
            cloudinaryUrl1: 'http://example.com/image.jpg',
            category: 'blockchain'
        });

        const res = await request(app).post('/api/v1/uploadblog')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: 1,
                title: 'This is the blog title',
                body: 'This is the blog sample body...',
                category: 'blockchain',
                cloudinaryUrl1: 'http://example.com/image.jpg',
            });

        console.log('Response body:', res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe("GET /api/v1/blogpagination", () => {

    it("should fetch all the posts", async() => {

        const mockBlogs = [
            {
                id: 1,
                userId: 1,
                title: 'First Blog',
                body: 'This is the body of the first blog.',
                cloudinaryUrl1: 'http://example.com/image1.jpg',
                category: Category.blockchain,
            },
            {
                id: 2,
                userId: 2,
                title: 'Second Blog',
                body: 'This is the body of the second blog.',
                cloudinaryUrl1: 'http://example.com/image2.jpg',
                category: Category.blockchain,
            }
        ];

        prismaClient.blog.findMany.mockResolvedValue(mockBlogs);

        const page = 1;
        const limit = 5;

        const res = await request(app).get(`/api/v1/blogpagination?page=${page}&limit=${limit}`);

        expect(res.statusCode).toBe(200);
    })
})

describe("GET /api/v1/byname/:searchQuery", () => {
    
    it("should fetch the posts by name", async() => {

        const mockBlogs = [
            {
                id: 1,
                userId: 1,
                title: 'First Blog',
                body: 'This is the body of the blog',
                cloudinaryUrl1: 'http://example.com',
                category: Category.blockchain,
            },
            
            {
                id: 2,
                userId: 2,
                title: 'Second Blog',
                body: 'This is the body of the blog1',
                cloudinaryUrl1: 'http://example.com',
                category: Category.blockchain,
            }
        ];

        prismaClient.blog.findMany.mockResolvedValue(mockBlogs);

        const name = 'bitcoin';


        const res = await request(app).get(`/api/v1/byname/${name}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Data Fetched Successfully')

    })
})

describe('GET /api/v1/bycategory/:categoryQuery', () => {
    it("should fetch the posts by category", async() => {

        const mockBlogs = [
            {
                id: 1,
                userId: 1,
                title: 'First Blog',
                body: 'This is the body of the blog',
                cloudinaryUrl1: 'http://example.com',
                category: Category.blockchain,
            },
            
            {
                id: 2,
                userId: 2,
                title: 'Second Blog',
                body: 'This is the body of the blog1',
                cloudinaryUrl1: 'http://example.com',
                category: Category.blockchain,
            }
        ];

        prismaClient.blog.findMany.mockResolvedValue(mockBlogs);

        const category = 'blockchain';

        const res = await request(app).get(`/api/v1/bycategory/${category}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Data Fetched Successfully')

    })
})

describe('POST /api/v1/like', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });
  
    it('should like the post successfully', async () => {
      const token = jwt.sign({ id: 1, name: 'Luke Skywalker', email: 'lukeskywalker@gmail.com' }, secretjwt);
  
      prismaClient.like.create.mockResolvedValue({
        id: 1,
        userId: 1,
        blogId: 15,
      });
  
      const res = await request(app).post('/api/v1/like').set('Authorization', `Bearer ${token}`).send({
        userId: 1,
        blogId: 15,
      });
  
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.data).toHaveProperty('userId');
      expect(res.body.data).toHaveProperty('blogId');

    });
  });

  describe('POST /api/v1/comment', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should post comment on a post successfully', async() => {
        const token = jwt.sign({ id: 1, name: 'Luke Skywalker', email: 'lukeskywalker@gmail.com' }, secretjwt);

        prismaClient.comment.create.mockResolvedValue({
            id: 1,
            userId: 1,
            blogId: 10,
            body: 'This is the comment.'
        });

        const res = await request(app).post('/api/v1/comment').set('Authorization', `Bearer ${token}`).send({
            userId: 1,
            blogId: 10,
            body: 'This is the comment.'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        
        expect(res.body.data).toHaveProperty('userId');
        expect(res.body.data).toHaveProperty('blogId');
        expect(res.body.data).toHaveProperty('body');

    });

    it('should return error for invalid inputs', async() => {
        const token = jwt.sign({ id: 1, name: 'Luke Skywalker', email: 'lukeskywalker@gmail.com' }, secretjwt);

        const res = await request(app).post('/api/v1/comment').set('Authorization', `Bearer ${token}`).send({
            userId: 1,
            blogId: 10,
            body: 'asdf'
        });

        expect(res.statusCode).toBe(411);
        expect(res.body).toHaveProperty('error');
    });
})

describe('POST /api/v1/saveblog', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should save a post successfully', async() => {
        const token = jwt.sign({ id: 1, name: 'Luke Skywalker', email: 'lukeskywalker@gmail.com' }, secretjwt);

        prismaClient.savedblog.create.mockResolvedValue({
            id: 1,
            userId: 1,
            blogId: 10
        });

        const res = await request(app).post('/api/v1/saveblog').set('Authorization', `Bearer ${token}`).send({
            userId: 1,
            blogId: 10
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        expect(res.body.data).toHaveProperty('userId');
        expect(res.body.data).toHaveProperty('blogId');
    });
})