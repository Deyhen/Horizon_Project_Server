import { connection } from ".."
import { MinecraftAPIRes, Server } from "../Models/servers.model";
import axios from "axios"

class NewsService{
    async getNews(){
        const res = (await connection.query('SELECT * FROM news'))[0];

        return res
    }
    async findNews(id: string){
        const res = (await connection.query('SELECT * FROM news WHERE id = ?', [id]))[0];

        return res
    }
}
export default new NewsService()