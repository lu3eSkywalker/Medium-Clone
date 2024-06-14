import { NextFunction, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import jwt, { Secret } from 'jsonwebtoken';
import authenticate from "../middlewares/Authorization";

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/v1/addfollower:
 *   post:
 *     summary: Follow a user
 *     tags: [Follows]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the current user
 *               toFollowUserId:
 *                 type: integer
 *                 description: ID of the user to follow
 *             required:
 *               - userId
 *               - toFollowUserId
 *     responses:
 *       200:
 *         description: Successfully added the follower
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Error adding the follower
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


export const toaddFollower = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const {userId, toFollowUserId} = req.body;


            await prisma.follows.create({
                data: {
                    followedById: toFollowUserId,
                    followingId: userId
                }
            })

            res.status(200).json({
                success: true,
                message: 'Successfully added the follower'
            })
        })
    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error adding the follower'
        })
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
 * /api/v1/unfollow:
 *   delete:
 *     summary: Follow a user
 *     tags: [Follows]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the current user
 *               toRemoveFollowingAUser:
 *                 type: integer
 *                 description: ID of the user to unfollow
 *             required:
 *               - userId
 *               - toRemoveFollowingAUser
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Error removing the follower
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

export const unfollow = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const { userId, toRemoveFollowingAUser }: { userId: number, toRemoveFollowingAUser: number } = req.body;

             await prisma.follows.delete({
                where: {
                    followingId_followedById: {
                        followedById: toRemoveFollowingAUser,
                        followingId: userId
                    }
                }
            });
    
            res.status(200).json({
                success: true,
                message: 'Successfully unfollowed the user'
            });
        });
    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error removing the follower'
        })
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
 * /api/v1/fetchfollower/{userId}:
 *   get:
 *     summary: Fetch all the followers of a user
 *     tags: [Follows]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to fetch the followers for
 *     responses:
 *       200:
 *         description: Successfully fetched the followers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items: 
 *                     type: object
 *                     properties:
 *                       id: 
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       following:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                       followedBy:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                 message: 
 *                   type: string
 *       500:
 *         description: Error fetching the followers
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

export const fetchFollowers = async(req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);

        const getFollowers = await prisma.user.findMany({
            where: {
                id: userId
            },
            include: {
                following: true,
                followedBy: true,
            }
        });

        res.status(200).json({
            success: true,
            data: getFollowers,
            message: 'Successfully fetched the followers'
        })

    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error fetching the follower'
        })
    }
}