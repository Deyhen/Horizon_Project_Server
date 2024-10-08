import { connection } from '..'
import { Post } from '../Models/posts.model'
import { v4 } from 'uuid'
import fs from 'fs'
import path from 'path'

class PostsService {
  async getPosts() {
    const res = (await connection.query<Post[]>('SELECT * FROM news'))[0]
    return res.reverse()
  }
  async findPost(id: string) {
    const res = (
      await connection.query<Post[]>('SELECT * FROM news WHERE id = ?', [id])
    )[0][0]
    return res
  }
  async createPost(title: string, content: string, imagePath: string) {
    const id = v4()
    await connection.query(
      'INSERT INTO news (`id`, `title`, `content`, `img`) VALUES (?, ?, ?, ?)',
      [id, title, content, imagePath]
    )

    const res = (await connection.query<Post[]>('SELECT * FROM news'))[0]
    return res.reverse()
  }
  async deletePost(id: string) {
    const { img } = (
      await connection.query<Post[]>('SELECT img FROM news WHERE id = ?', [id])
    )[0][0]
    const filePath = path.join(process.cwd(), 'static', img)
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`)
        return
      }
    })

    await connection.query('DELETE FROM news WHERE id = ?', [id])

    const res = (await connection.query<Post[]>('SELECT * FROM news'))[0]
    return res.reverse()
  }
}
export default new PostsService()
