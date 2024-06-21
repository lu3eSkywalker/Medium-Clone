import { Request, Response } from "express";

import { Category, PrismaClient } from '@prisma/client';
import { prismaClient } from "../db";
const prisma = new PrismaClient();




/**
 * @swagger
 * /api/v1/allblogs:
 *   get:
 *     summary: Fetch all the blogs
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: This is the entire Blogs list
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
 *                      type: object
 *                      properties:
 *                      id: 
 *                        type: integer
 *                      userId:
 *                          type: integer
 *                      title: 
 *                          type: string
 *                      body: 
 *                          type: string
 *                      cloudinaryUrl1:
 *                          type: string
 *                      category:
 *                          type: string
 *                 message: 
 *                   type: string
 *       500:
 *         description: Fetching Post Process Failed
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

export const FetchAllBlogs = async(req: Request, res: Response): Promise<void> => {
    try {
        const allBlogs = await prismaClient.blog.findMany({});

        res.status(200).json({
            success: true,
            data: allBlogs,
            message: 'This is entire Blogs List'
        });
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Fetching Post Process Failed',
        });
    }
}
/**
 * @swagger
 * /api/v1/blogpagination:
 *   get:
 *     summary: Fetch all the blogs with pagination
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of blogs per page
 *     responses:
 *       200:
 *         description: This is the entire Blogs list
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
 *                       userId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       cloudinaryUrl1:
 *                         type: string
 *                       category:
 *                         type: string
 *                 message: 
 *                   type: string
 *       500:
 *         description: Fetching Post Process Failed
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

export const FetchAllBlogsPagination = async(req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const offset = (page - 1) * limit;

        const allBlogs = await prismaClient.blog.findMany({
            skip: offset,
            take: limit
        });

        res.status(200).json({
            success: true,
            data: allBlogs,
            message: 'This is entire Product List'
        })
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Fetching Post Process Failed',
        })
    }
}


/**
 * @swagger
 * /api/v1/byname/{searchQuery}:
 *   get:
 *     summary: Get the blog by name
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: searchQuery
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the blog
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of blogs per page
 *     responses:
 *       200:
 *         description: Data fetched successfully
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
 *                       userId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       cloudinaryUrl1:
 *                         type: string
 *                       category:
 *                         type: string
 *                 data2:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       cloudinaryUrl1:
 *                         type: string
 *                       category:
 *                         type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: No data found with the given Id
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
 *         description: Error fetching blogs by name
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


//This api can fetch the blogs based on both the title and keywords in the blog.
export const getBlogByName = async(req: Request, res: Response): Promise<void> => {
    try {
        const searchQuery = req.params.searchQuery;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const offset = (page - 1) * limit;

        const blogsByNameTitle = await prismaClient.blog.findMany({
            where: {
                title: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            },
            skip: offset,
            take: limit
        });

        const blogsByNameBody = await prismaClient.blog.findMany({
            where: {
                body: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            },
            skip: offset,
            take: limit 
        });

        if(!blogsByNameTitle) {
            res.status(404).json({
                success: false,
                message: 'No Data found with the given Id'
            })
            return;
        }

        res.status(200).json({
            success: true,
            data: blogsByNameTitle,
            data2: blogsByNameBody,
            message: 'Data Fetched Successfully'
        })
    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error Fetching Blogs by Name'
        });
    }
}

/**
 * @swagger
 * /api/v1/bycategory/{categoryQuery}:
 *   get:
 *     summary: Get the blog by category
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: categoryQuery
 *         schema:
 *           type: string
 *         required: true
 *         description: Category of the query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of blogs per page
 *     responses:
 *       200:
 *         description: Data fetched successfully
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
 *                       userId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       cloudinaryUrl1:
 *                         type: string
 *                       category:
 *                         type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Error fetching the blogs by category
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
 *         description: Error fetching blogs by Categeory
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

export const getBlogByCategory = async(req: Request, res: Response): Promise<void> => {
    try {
        const categoryQuery: Category = req.params.categoryQuery as Category;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const offset = (page - 1) * limit;

        const blogs = await prismaClient.blog.findMany({
            where: {
                category: categoryQuery
            },
            skip: offset,
            take: limit
        });

        if(blogs.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Error fetching the blogs by category'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: blogs,
            message: 'Data Fetched Successfully'
        })
    }
    catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            success: false,
            message: 'Error Fetching Products by category'
        });
    }
}