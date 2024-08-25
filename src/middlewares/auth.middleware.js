import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";

const verifyJWT = async(req, _, next) => {
    //get the token from cookies or header
    //decode the token using private key
    //get user from db using _id from decoded token and remove password and refreshToken from it
    //add user info to req so that logout can be achieved (or any other similar functionality)

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")// for mobile  req.header("Authorization")
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
        
        // console.log("Token: ", token)
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // console.log("DecodedToken: ", decodedToken)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")   
    }

    
}

export { verifyJWT };
