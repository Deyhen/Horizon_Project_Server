import { Router } from 'express'
import postsController from '../Controllers/posts.controller'
import multer from 'multer'

const postsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/postsImages') // Directory to store avatars
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname) // Unique filename
  },
})

export const uploadPosts = multer({ storage: postsStorage })

export const postsRouter = Router()

postsRouter.get('/posts', postsController.getPosts)
postsRouter.get('/posts/:id', postsController.findPost)
postsRouter.post(
  '/posts',
  uploadPosts.single('img'),
  postsController.createPost
)
postsRouter.delete('/posts/:id', postsController.deletePost)
