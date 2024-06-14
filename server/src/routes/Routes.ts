import express from 'express';
import { login, signupUser } from '../controllers/Signup_LoginUsers';
import upload from '../middlewares/multer';
import { CreateBlog } from '../controllers/BlogsCreation';
import { CommentBlog, LikeBlog, deleteComment, deleteLike, deletesavedBlog, saveBlog } from '../controllers/Like_Comment_Save';
import { FetchAllBlogs, FetchAllBlogsPagination, getBlogByCategory, getBlogByName } from '../controllers/FetchingBlogs';
import { fetchFollowers, toaddFollower, unfollow } from '../controllers/Followers_following';

const router: express.Router = express.Router();


router.post('/signup', signupUser);
router.post('/login', login);
router.post('/uploadblog', upload.single('image'), CreateBlog);
router.post('/like', LikeBlog);
router.post('/comment', CommentBlog);
router.post('/saveblog', saveBlog);
router.post('/addfollower', toaddFollower);


router.get('/allblogs', FetchAllBlogs);
router.get('/blogpagination', FetchAllBlogsPagination);
router.get('/byname/:searchQuery', getBlogByName);
router.get('/bycategory/:categoryQuery', getBlogByCategory);
router.get('/fetchfollower/:userId', fetchFollowers);


router.delete('/deletecomment', deleteComment);
router.delete('/deletelike', deleteLike);
router.delete('/deletesave', deletesavedBlog);
router.delete('/unfollow', unfollow)

export default router;