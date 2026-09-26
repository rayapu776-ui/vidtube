import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { JsonWebTokenError } from "jsonwebtoken";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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

const logoutUser = asyncHandler(async (req , res)=> {
  await User.findByIdAndUpdate(
    //TODO : need to come back here after middleware
    req.user._id,
    {
      $set : {
        refreshToken : undefined,
      }
    },
    {new : true}

  )

  const options  = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production"
  }

  return res
  .status(200)
  .clearCookie("accesToken" , options)
  .clearCookie("refreshToken" , options)
  .json(new ApiResponse(200 , {}, "User logged out seccessfully"))


})


const refreshAccessToken = asyncHandler (async (req , res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
      throw new ApiError(401, "Refresh token is required")
    }

    try {
     const decodedToekn = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )
    const user =  await User.findById(decodedToekn?._id)

    if(!user){
      throw new ApiError(401 , " Invalied refersh token")
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401 , "Invalid refresh token")
    }

    const options = {
      httpOnly : true ,
      secure : process.env.NODE_ENV === "production",
    }

  const {accessToken , refreshToken: newRefreshToken } = await generateAccessAndRefereshToken(user._id)
     
  return res
  .status(200)
  .cookie("accessToken", accessToken , options)
  .cookie("refreshToken", refreshToken , options)
  .json(
    new ApiResponse(
      200 , {accessToken , refreshToken : newRefreshToken}, 
      "Access token refreshed successfully"
    ))


    } catch (error) {
      throw new ApiResponse(500 , "something wenr wrong while refreshing acces token")
    }

})

const changeCurrentPassword = asyncHandler( async( req , res) =>{
  const {oldPassword , newPassword} = req.body

 const user = await User.findById(req.user?._id)
 
  user.isPasswordValid = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordValid){
    throw new ApiError(401 , "old password is incorrect")
  }
  user.password = newPassword

  await user.save({validateBeforeSave : false})

  return res.status(200).json( new ApiResponse(200 , {} , "Password changed successfully"))



})

const getCurrentUser = asyncHandler( async (req , res) => {
  return res.status(200).json(new ApiResponse(200 , req.user, "Current user details"))
})

const updateAccountDetails = asyncHandler( async (req , res) => {
  const {fullname , email } = req.body

  if(!fullname){
    throw new ApiError(400 , "FUllname is required")
  }

  if(!email){
    throw new ApiError(400 , " Fullname is required")
  }

const user =  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        fullname ,
        email : email
      }
    },
    {new : true}
  ).select("-password -refreshToken")

  return res.status(200).json(new ApiResponse(200 , user , "Account details updated succesfully"))

})

const updateUserAvatar = asyncHandler( async (req , res) => {
 const avatarLocalPath = req.file?.path


 if(!avatarLocalPath){
  throw new ApiError(400 , "File is required")
 }

 const avatar = await uploadOnCloudinary(avatarLocalPath)

 if(!avatar.url){
  throw new ApiError(500 , "Something went wrong while uploading avatar")
 }

const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set : {
      avatar : avatar.url
    }
  },
  {new : true}
 ).select("-password -refreshToken")

res.status(200).json( new ApiResponse(200 , user , "Avatar updated succesfully"))
})

const updateUserCoverImage = asyncHandler( async (req , res) => {
const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(400 , "File is required")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(500 , "Something wenr wrong while uploading cover images")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        coverImage : coverImage.url
      }
    },
    {new : true}
  ).select("-password -refreshToken")

res.status(200).json( new ApiResponse(200 , user , "CoverImages updated succesfully"))

})

const getUserChannelProfile = asyncHandler( async (req , res) => {
  const {username} = req.params

  if(!username?.trim()){
    throw new ApiError(400 , "Username is reuired")
  }

  const channel = await User.aggregate(
    [
      {
        $match :
        {
         username : username?.toLowerCase()
        }
      },
      {
        $lookup : {
          from : "subscriptions",
          localField : "_id",
          foreignField : "channel",
          as : "subscribers"
        }
      },
      {
        $lookup : {
          from : "subscriptions",
          localField : "_id",
          foreignField : "subscriber",
          as : "subscriberedTo"
        }
      },
      {
        $addFields : {
          subscriberCount : {
            $size : "$subscribers",
          },
          channelsSubscribedToCount : {
            $size : "$subscriberdTo"
          },
          isSubscribed : {
            $cond : {
              if : {$in : [req.user?._id , "$subscribers.subscriber"]},
              then : true ,
              else : false
            }
          }
        }
      },
      {
        //project only the necessary data 
        $project : {
          fullname : 1,
          username : 1,
          avatar : 1, 
          subscriberCount : 1,
          channelsSubscribedToCount : 1,
          isSubscribed :1,
          coverImage : 1 ,
          email :1 
        }
      }
    ]
  )

  if(!channel){
    throw new ApiError(404 , "Channel not found")
  }

  return res.status(200).json(new ApiResponse(
    200,
    channel[0],
    "Channel profile fetched successfully"
  ))

})

const getWatchHistory = asyncHandler( async (req , res) => {
  const user = await User.aggregate(
    [
      {
        $match : {
        _id : new mongoose.Types.ObjectId(req.user?._id)
        }
      },
      {
        $lookup : {
          from : "videos",
          localField : "watchHistory",
          foreignField : "_id",
          as : "WatchHistory",
          pipeline : [
            {
              $lookup : {
                from : "Users",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
                pipeline : [
                  {
                    $project : {
                      fullname : 1,
                      username : 1,
                      avatar : 1
                    }
                  }
                ]
              }
            },
            {
              $addFields : {
                owner : {
                  $first : "owner"
                }
              }
            }
          ]
        }
      }
    ])

res.status(200).json( new ApiResponse(200 , user[0]?.WatchHistory , "Watch history fetched succesfully"))
})


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
