import { NextFunction, Request, Response } from "express"
import {z} from 'zod';
import jwt, { Secret } from 'jsonwebtoken';


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import authenticate from "../middlewares/Authorization";


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/v1/like:
 *   post:
 *     summary: Like a Post
 *     tags: [Like]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - blogId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user liking the blog
 *               blogId:
 *                 type: integer
 *                 description: ID of the blog post to like 
 *     responses:
 *       200:
 *         description: Entry Created Successfully
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
 *                     blogId:
 *                       type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Error Liking the Post
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



export const LikeBlog = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const {userId, blogId} = req.body as{userId: number, blogId: number};

            const newLike = await prisma.like.create({
                data: {
                    userId: userId,
                    blogId: blogId
                }
            });
    
            res.status(200).json({
                success: true,
                data: newLike,
                message: 'Entry Created Successfully'
            })
        })

    }

    catch(error)  {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Error Liking the Post'
        });
    }
}

const commentSchema = z.object({
    body: z.string().min(5).max(100000),
})

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/v1/comment:
 *   post:
 *     summary: Add comment to a post
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - blogId
 *               - body
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user commenting on the blog
 *               blogId:
 *                 type: integer
 *                 description: ID of the blog post to comment on
 *               body: 
 *                 type: string
 *                 description: Content of the comment
 *     responses:
 *       200:
 *         description: Entry Created Successfully
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
 *                     blogId:
 *                       type: integer
 *                     body: 
 *                       type: string 
 *                 message:
 *                   type: string
 *       500:
 *         description: Error commenting on the post
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


export const CommentBlog = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const {userId, blogId} = req.body as{userId: number, blogId: number};


            const parsedInput = commentSchema.safeParse(req.body);
            if(!parsedInput.success) {
                res.status(411).json({
                    error: parsedInput.error
                })
                return;
            }
    
            const body = parsedInput.data.body;
    
            const newComment = await prisma.comment.create({
                data: {
                    userId: userId,
                    blogId: blogId,
                    body: body
                }
            });
    
            res.status(200).json({
                success: true,
                data: newComment,
                message: 'Entry Created Successfully'
            })
        })


    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error Commenting the Post'
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
 * /api/v1/saveblog:
 *   post:
 *     summary: Save a blog
 *     tags: [Savedblog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - blogId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user saving the blog post
 *               blogId:
 *                 type: integer
 *                 description: ID of the blog post to be saved
 *     responses:
 *       200:
 *         description: Successfully saved the post
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
 *                     blogId:
 *                       type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Error saving the blog
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


export const saveBlog = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const {blogId, userId} = req.body

            const savedBlog = await prisma.savedblog.create({
                data: {
                    userId: userId,
                    blogId: blogId
                }
            });
    
            res.status(200).json({
                success: true,
                data: savedBlog,
                message: 'Successfully saved the post'
            })
        })
    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error saving the blog'
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
 * /api/v1/deletelike:
 *   delete:
 *     summary: Remove the like
 *     tags: [Like]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - likeId
 *             properties:
 *               likeId:
 *                 type: integer
 *                 description: ID of the post like to be removed
 *     responses:
 *       200:
 *         description: Successfully deleted the like
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
 *                       type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Error deleting the like
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



export const deleteLike = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const{likeId} = req.body;

            const deletedLike = await prisma.like.delete({
                where: {
                    id: likeId
                }
            });
    
            res.status(200).json({
                success: true,
                data: deletedLike,
                message: 'Successfully deleted the like.'
            })
        })
    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error deleting the like.'
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
 * /api/v1/deletecomment:
 *   delete:
 *     summary: Remove the comment
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentId
 *             properties:
 *               commentId:
 *                 type: integer
 *                 description: ID of the comment to be removed
 *     responses:
 *       200:
 *         description: Successfully deleted the comment
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
 *                       type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Error deleting the comment
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


export const deleteComment = async(req: Request, res: Response): Promise<void> => {
    try {

        authenticate(req, res, async() => {
            const {commentId} = req.body

            const deleteComment = await prisma.comment.delete({
                where: {
                    id: commentId
                },
            });
    
            res.status(200).json({
                success: true,
                data: deleteComment,
                message: 'Successfully deleted the comment.'
            });
        })
    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error deleting the comment.'
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
 * /api/v1/deletesave:
 *   delete:
 *     summary: Remove the saved post
 *     tags: [Savedblog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - savedblogId
 *             properties:
 *               savedblogId:
 *                 type: integer
 *                 description: ID of the saved blog to be removed
 *     responses:
 *       200:
 *         description: Successfully deleted the saved blog
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
 *                       type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Error deleting the saved blog
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

export const deletesavedBlog = async(req: Request, res: Response): Promise<void> => {
    try{

        authenticate(req, res, async() => {
            const {savedblogId} = req.body;

            const deletesave = await prisma.savedblog.delete({
                where: {
                    id: savedblogId
                }
            });
    
            res.status(200).json({
                success: true,
                data: deletesave,
                message: 'Successfully deleted the saved blog'
            });
        });
    }
    catch(error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error deleting the saved blog'
        })
    }
}