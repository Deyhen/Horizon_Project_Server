import { Router } from "express";
import newsController from "../Controllers/news.controller";

const serversRouter = Router()

serversRouter.get('/news', newsController.getNews)