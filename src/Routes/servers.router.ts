import { Router } from "express";
import serversController from "../Controllers/servers.controller";

const serversRouter = Router()

serversRouter.get('/servers', serversController.getServers)
serversRouter.get('/servers/:server', serversController.findServer)