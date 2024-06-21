import { NextFunction, Request, Response } from "express";
import {z} from 'zod';
import dotenv from 'dotenv';
dotenv.config();

import jwt, { Secret } from 'jsonwebtoken';

import { cloudinary } from "../utils/cloudinary";
import { Category, PrismaClient } from '@prisma/client';
import authenticate from "../middlewares/Authorization";
const prisma = new PrismaClient();
import { prismaClient } from "../db";



const blogSchema = z.object({
    title: z.string().min(5).max(500),
    body: z.string().min(10).max(1000000000),
})

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/v1/uploadblog:
 *   post:
 *     summary: Create a new blog entry
 *     tags: [Blog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user creating the blog entry
 *               category:
 *                 type: string
 *                 description: Category of the blog
 *               title:
 *                 type: string
 *                 description: Title of the blog entry
 *               body:
 *                 type: string
 *                 description: Content/body of the blog entry
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to be uploaded with the blog entry
 *             required:
 *               - userId
 *               - category
 *               - title
 *               - body
 *               - image
 *     responses:
 *       200:
 *         description: Blog entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     body:
 *                       type: string
 *                     cloudinaryUrl:
 *                       type: string
 *                     category:
 *                       type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       411:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *       500:
 *         description: Internal Server Error - Entry creation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */


export const CreateBlog = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            let result
            if(req.file) {
                result = await cloudinary.uploader.upload(req.file.path);
            } else {
                result = await cloudinary.uploader.upload(req.body.filePath);
            }
    
            const {category} = req.body as {category: Category};
    
            const userId = parseInt(req.body.userId)
    
            const parsedInput = blogSchema.safeParse(req.body);
            if(!parsedInput.success) {
                res.status(411).json({
                    error: parsedInput.error
                })
                return;
            }
    
            const title = parsedInput.data.title;
            const body = parsedInput.data.body;
            const url = result ? result.secure_url : null;
    
            
            const newBlog = await prismaClient.blog.create({
                data: {
                    userId: userId,
                    title: title,
                    body: body,
                    cloudinaryUrl1: url,
                    category: category
                }
            })
    
            res.status(200).json({
                success: true,
                data: newBlog,
                message: 'Entry Created Successfully'
            });
        });

    }
    catch(error) {
        console.log('Error: ', error)
        res.status(500).json({
            success: false,
            message: 'Entry Creation Failed'
        })
    }
}