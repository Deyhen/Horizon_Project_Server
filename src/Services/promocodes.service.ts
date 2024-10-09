import { v4 } from "uuid"
import { connection } from ".."
import { ApiError } from "../exceptions/api.error"
import { PromocodeSchema, UserSchema } from "../Models/user.model"
import tokensService from "./tokens.service"

class PromocodesService {
    async activatePromocode(promocode: string, token: string) {
        const id = await tokensService.getIdByToken(token)
    
        if (!id) {
          throw ApiError.UnauthorizedError()
        }
        const user = (
          await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
            id,
          ])
        )[0][0]

        user.activatedPromocodes.map(item => {
            const parsedItem = JSON.parse(item)
            console.log(parsedItem, promocode);
            if(parsedItem.name === promocode){
                throw ApiError.BadRequest('Ви вже використовували цей промокод')
            }
            });
        const promocodeData = (
          await connection.query<PromocodeSchema[]>(
            'SELECT * FROM promocodes WHERE name = ?',
            [promocode]
          )
        )[0][0]
    
        if (!promocodeData) {
          throw ApiError.BadRequest('Promocode does not exist')
        }

        await connection.query(
          "UPDATE users SET donateCurrency = ?, gameCurrency = ? WHERE id = ?",
          [
            user.donateCurrency + promocodeData.bonusDonateCurrency,
            user.gameCurrency + promocodeData.bonusGameCurrency,
            id,
          ]
        )

        await connection.query(
            `UPDATE users 
             SET activatedPromocodes = JSON_ARRAY_APPEND(activatedPromocodes, '$', ?) 
             WHERE id = ?`,
            [JSON.stringify(promocodeData), id]
          )
    
        await connection.query('DELETE FROM promocodes WHERE id = ?', [
          promocodeData.id,
        ])
    
        return
      }
      async addNewPromocodes(name: string, gameBonus: number, donateBonus: number, amount: number){
        
        for(let i = 0; i < amount; i++){
            const id = v4()
            await connection.query(
            'INSERT INTO promocodes (id, name, bonusGameCurrency, bonusDonateCurrency) VALUES (?, ?, ?, ?)', [id, name, gameBonus, donateBonus])
        }

        return
      }
}

export default new PromocodesService()