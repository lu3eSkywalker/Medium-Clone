import { NextFunction, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import jwt, { Secret } from 'jsonwebtoken';

const prisma = new PrismaClient();




const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret);
        req.user = decoded;
        next();
    } catch(error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};


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


export const unfollow = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const {userId, toRemoveFollowingAUser} = req.body;

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


export const fetchFollowers = async(req: Request, res: Response): Promise<void> => {
    try {
        const {userId} = req.body;

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
            message: 'Error adding the follower'
        })
    }
}