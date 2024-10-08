import { NextFunction, Request, Response } from 'express'
import serversService from '../Services/servers.service'

class ServersController {
  async getServers(req: Request, res: Response, next: NextFunction) {
    try {
      const servers = await serversService.getServers()

      res.status(200).json(servers)
    } catch (error) {
      next(error)
    }
  }
  async findServer(req: Request, res: Response, next: NextFunction) {
    try {
      const server = req.params.server
      const foundServer = await serversService.findServer(server)

      res.status(200).json(foundServer)
    } catch (error) {
      next(error)
    }
  }
}

export default new ServersController()
