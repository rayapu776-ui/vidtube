import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"


const generateAccessAndRefereshToken = async (userId) => {
 try {
  const user = await User.findById(userId)
 
  //Small check for user existence
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()
 
  user.refreshToken  =  refreshToken
  await user.save({validateBeforeSave : false})
  return {accessToken , refreshToken}
 } catch (error) {
  throw new ApiError(500, "Something went wrong while generating acces and refresh tokens")
 }
}

const registerUser =  asyncHandler(async (req , res) => {
    const {fullanme , email , username , password } = reg.body

    //validation
    if(
    [fullname , username , email , password].some((field) => field?.trim() ==="")
    ){
        throw new ApiError(400, "All fileds are required")
    }

    const existedUser = await User.findOne({
        $or : [{username} , {email}]
    })

    if(existedUser){
       throw new ApiError(409, "User with email or Username already exists") 
    }
    console.warn(req.files)

   const avatarLocalPath = req.files?.avatar[0]?.path
   const coverLocalPath = req.files?.coverImage[0]?.path

   if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is missing")
   }
   
//    const avatar = await uploadOnCloudinary(avatarLocalPath)
//   let coverImage = ""
//    if(coverLocalPath){
//     coverImage = await uploadOnCloudinary(coverImage)
//    }
let avatar;
try{
avatar = await uploadOnCloudinary(avatarLocalPath)
console.log("Uploaded avatar",avatar)
}catch(error){
console.log("Error uploading avatar" , error)
throw new ApiError(500 , "Failed to upload avatar")
}

let coverImage;
try{
coverImage = await uploadOnCloudinary(coverLocalPath)
console.log("Uploaded coverImage",coverImage)
}catch(error){
console.log("Error uploading coverImage" , error)
throw new ApiError(500 , "Failed to upload coverImage")
}


  try {
     const user =  await User.create({
      fullname ,
      avatar : avatar.url ,
      coverImage : coverImage?.url || "" ,
      email,
      password,
      username : username.toLowerCase()
     })
  
    const cratedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )
  
    if(!createdUser){
      throw new ApiError(500, "Something went wrong while registering a user")
  
    }
  
  return res
  .status(201)
  .json(new ApiResponse(200 , createdUser , "user registed successfully"))
  
  } catch (error) {
    console.log("User Creation failed")

    if(avatar){
        await deleteFromCloudinary(avatar.public_id)
    }
    if(coverImage){
        await deleteFromCloudinary(coverImage.public_id)
    }
    throw new ApiError(500, "Something went wrong while registering a user and images were deleted")
  }
})

const loginUser = asyncHandler (async (req , res)=> {
  //get data from body 

  const {email , use , password} = req.body

  //validation
  if(!email){
    throw new ApiError(400 , "Email is required")
  }

  const user = await User.findOne({
    $or : [{username} , {email}]
  })
 if(!user){
  throw new ApiError(404 ,"User not found")
 }

 //validate password

 const isPasswordValid =  await user.isPasswordCorrect(password)

if(!isPasswordValid){
  throw new ApiError(401 , "Invalid Credentials")
}
const {accessToken , refreshToken} = await generateAccessAndRefereshToken(user._id)


const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {
  httpOnly : true ,
  secure : process.env.NODE_ENV === "production"
}

return res.status(200)
.cookie("accessToken", accessToken , options)
.cookie("refreshToken", refreshToken, options)
.json(new ApiResponse(200 , loggedInUser ,
  {user : loggedInUser , accessToken , refres},
"User looged in succesffuly"))


})


export {
    registerUser,
    loginUser,
    
}
