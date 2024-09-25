import {ApiError} from '../exceptions/api.error'

export default function (err: Error, req, res, next){
    console.log(err);
    if(err instanceof ApiError){
        return res.status(err.status).json({message: err.message, errors: err.errors})
    }
    return res.status(500).json({message: "Unexpected Error"})
}