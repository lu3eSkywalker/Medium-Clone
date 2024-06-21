import { Request, Response } from "express";
import {z} from 'zod';
import bcrypt from 'bcrypt';
import dotenv, { parse } from 'dotenv';
dotenv.config();
import jwt, { Secret } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { prismaClient } from "../db";
const prisma = new PrismaClient();

const secretjwt: string = process.env.JWT_SECRET || ''


const SignupUserSchema = z.object({
    name: z.string().min(2).max(20),
    email: z.string().email(),
    password: z.string().min(5)
})

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
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
 *         description: Entry Creation Failed
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


export const signupUser = async(req: Request, res: Response): Promise<void> => {
    try {

        // const {name, email, password} = req.body as {name: string, email: string, password: string}

        const parsedInput = SignupUserSchema.safeParse(req.body);
        if(!parsedInput.success) {
            res.status(411).json({
                error: parsedInput.error
            })
            return;
        }

        const name = parsedInput.data.name;
        const email = parsedInput.data.email;
        const password = parsedInput.data.password;

        let hashedPassword: string;
            hashedPassword = await bcrypt.hash(password, 10);

            const response = await prismaClient.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                }
            })

            res.status(200).json({
                success: true,
                data: response,
                message: 'Signed up successfully'
            })

    }
    catch(error) {
        console.log('Error: ', error)
        res.status(500).json({
            success: false,
            message: 'Entry Creation Failed',
        })
    }
}

const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
})

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [User]
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: 
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Logged in successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
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
 *         description: Internal Server Error
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


export const login = async(req: Request<{ email: string, password: string}>, res: Response): Promise<void> => {
    try {
        const parsedInput = UserLoginSchema.safeParse(req.body);
        if(!parsedInput.success) {
            res.status(411).json({
                error: parsedInput.error
            })
            return;
        }

        const email = parsedInput.data.email;
        const password = parsedInput.data.password;

        const user = await prismaClient.user.findUnique({
            where: {
                email: email,
            }
        });

        if(!user) {
            res.status(404).json({
                success: false,
                message: 'User not registered',
            });
            return
        }

        const payload = {
            email: user.email,
            name: user.name,
            id: user.id,
        }

        const compare = await bcrypt.compare(password, user.password)

        if(compare) {
            const token = jwt.sign({payload}, secretjwt, { expiresIn: "24hr"} )

            res.status(200).json({
                success: true,
                data: user,
                token: token,
                message: 'Logged in succesfully'
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Password Incorrect",
            });
            return;
        }

    }
    catch(error) {
        console.log('Error: ', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        })
    }
}