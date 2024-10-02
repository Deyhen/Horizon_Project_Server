import { NextFunction, Request, Response } from "express";
import serversService from "../Services/servers.service";

class ServersController{
    async getServers(req: Request, res: Response, next: NextFunction){
        try {
            const servers = await serversService.getServers()

            res.status(200).json(servers)
        } catch (error) {
            next()
        }
    }
}

export default new ServersController()