import { NextFunction, Request, Response } from "express"
import {z} from 'zod';
import jwt, { Secret } from 'jsonwebtoken';


import { PrismaClient } from '@prisma/client';
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
}




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