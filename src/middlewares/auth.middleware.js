import jwt from "jsonwebtoken"
import {User} from "../models/users.models.js"
import {APiError, ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"


export const verifyJWT = asyncHandler(async (req , _ , next) => {

    const token = req.cookies.accesToken || req.header("Authorization")?.replace("Bearer" , "")

    if(!token){
        throw new ApiError(401 , "Unauthorized")
    }
    try {
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refershToken")

        if(!user){
            throw new ApiError(401 , "Unauthorized")
        }

        req.user = user
        
        next()
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalide acees token")

    }
})