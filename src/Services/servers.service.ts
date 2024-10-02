import { connection } from ".."
import { MinecraftAPIRes, Server } from "../Models/servers.model";
import axios from "axios"

class ServersService{
    async getServers(){
        const res = (await connection.query<Server[]>('SELECT * FROM servers'))[0];

        const servers = res.map(async (server)=>{
           const playersNow = (await axios.get(`https://mcapi.us/server/status?ip=${server.ip}${server.port && '&' + server.port}`) as MinecraftAPIRes).players.now
           if(playersNow !== server.playersNow){
                await connection.query('UPDATE servers SET playersNow = ? WHERE title = ?', [playersNow, server.title])
           }
           return server
        })

        return servers

        
    }
}
export default new ServersService()