import { NextFunction, Request, Response } from "express";
import newsService from "../Services/news.service";

class NewsController{
    async getNews(req: Request, res: Response, next: NextFunction){
        try {
            const news = await newsService.getNews()

            res.status(200).json(news)
        } catch (error) {
            next()
        }
    }
    async findNews(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id
            const news = await newsService.findNews(id)

            res.status(200).json(news)
        } catch (error) {
            next()
        }
    }
}

export default new NewsController()