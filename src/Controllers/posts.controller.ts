import { NextFunction, Request, Response } from "express";
import postsService from "../Services/posts.service";

class PostsController{
    async getPosts(req: Request, res: Response, next: NextFunction){
        try {
            const posts = await postsService.getPosts()

            res.status(200).json(posts)
        } catch (error) {
            next()
        }
    }
    async findPost(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id
            const posts = await postsService.findPost(id)
            res.status(200).json(posts)
        } catch (error) {
            next()
        }
    }
    async deletePost(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id
            const posts = await postsService.deletePost(id)
            res.status(200).json(posts)
        } catch (error) {
            next()
        }
    }
    async createPost(req: Request, res: Response, next: NextFunction){
        try {
            const { title, content } = req.body;  // Username sent with the request

            if (!title || !content || !req.file) {
              return res.status(400).json({ success: false, message: 'Invalid data' });
            }
            const imagePath = `/postsImages/${req.file.filename}`;  // Path to the uploaded file

            const posts = await postsService.createPost( title, content, imagePath)

            console.log(posts);
        
            res.status(200).json(posts);
          } catch (error) {
            console.error('Error uploading avatar:', error);
            res.status(500).json({ success: false, message: 'Server error' });
          }
    }
}

export default new PostsController()