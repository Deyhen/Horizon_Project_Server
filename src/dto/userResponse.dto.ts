import { UserSchema } from "../Models/user.model";
import userDto from "./user.dto";

class userResponseDataDto{
    accessToken: string;
    user: {
        id: string;
        username: string;
        password: string;
        email: string;
        isActivated: boolean;
        role: string;
    } = {
        id: '',
        username: '',
        password: '',
        email: '',
        isActivated: false,
        role: '',
    }
    constructor(model: {accessToken: string, user:userDto}){
        this.accessToken = model.accessToken;
        this.user.id = model.user.id;
        this.user.username = model.user.username;
        this.user.password = model.user.password;
        this.user.email = model.user.email;
        this.user.isActivated = model.user.isActivated;
        this.user.role = model.user.role
    }
}
export default userResponseDataDto