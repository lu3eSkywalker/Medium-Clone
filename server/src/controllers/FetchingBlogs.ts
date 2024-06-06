import { Request, Response } from "express";

import { Category, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const FetchAllBlogs = async(req: Request, res: Response): Promise<void> => {
    try {
        const allBlogs = await prisma.blog.findMany({});

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
            messagse: 'Fetching Post Process Failed',
        });
    }
}


export const FetchAllBlogsPagination = async(req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const offset = (page - 1) * limit;

        const allBlogs = await prisma.blog.findMany({
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

export const getBlogByName = async(req: Request, res: Response): Promise<void> => {
    try {
        const searchQuery = req.params.searchQuery;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const offset = (page - 1) * limit;

        const blogsByNameTitle = await prisma.blog.findMany({
            where: {
                title: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            },
            skip: offset,
            take: limit
        });

        const blogsByNameBody = await prisma.blog.findMany({
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

export const getBlogByCategory = async(req: Request, res: Response): Promise<void> => {
    try {
        const categoryQuery: Category = req.params.categoryQuery as Category;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        const offset = (page - 1) * limit;

        const blogs = await prisma.blog.findMany({
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
            message: 'Error Fetching Products by Name'
        });
    }
}