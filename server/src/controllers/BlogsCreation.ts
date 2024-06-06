import { NextFunction, Request, Response } from "express";
import {z} from 'zod';
import dotenv from 'dotenv';
dotenv.config();

import jwt, { Secret } from 'jsonwebtoken';

import { cloudinary } from "../utils/cloudinary";
import { Category, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const blogSchema = z.object({
    title: z.string().min(5).max(500),
    body: z.string().min(100).max(1000000000),
})

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    if(!token) {
        return res.status(401).json({message: 'Unauthorized: Missing token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret);
        req.user = decoded;
        next();
    }
    catch(error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token'})
    }
}


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
    
            
            const newBlog = await prisma.blog.create({
                data: {
                    userId: userId,
                    title: title,
                    body: body,
                    cloudinaryUrl1: result.secure_url,
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