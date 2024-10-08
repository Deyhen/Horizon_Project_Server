import { ResultSetHeader } from 'mysql2'

export interface Post extends ResultSetHeader {
  title: string
  content: string
  img: string
}
