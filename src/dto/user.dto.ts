import { UserSchema } from "../Models/user.model";

class userDto{
    id: string;
    username: string;
    password: string;
    email: string;
    isActivated: boolean;
    role: string;
    gameCurrency: number;
    donateCurrency: number;

    constructor(model: UserSchema){
        this.id = model.id;
        this.username = model.username;
        this.password = model.password;
        this.email = model.email;
        this.isActivated = model.isActivated;
        this.role = model.role;
        this.gameCurrency = model.gameCurrency;;
        this.donateCurrency = model.gameCurrency;

    }

}

export default userDto; 