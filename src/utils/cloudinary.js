import {v2 as cloudinary} from 'cloudinary'
import { trusted } from 'mongoose';
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()


//configure cloudinary
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECTET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // console.log("Cloudinary Config:", {
        //     cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        //     api_key : process.env.CLOUDINARY_API_KEY,
        //     api_secret : process.env.CLOUDINARY_API_SECTET
        // });
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type : "auto"
            }
        )
        console.log("File upload on cloudinary. File src :" + response.url)

        // once the file is upload , we like to delete it from our server.
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("Error on Cloudinary", error)
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
      const result =  cloudinary.uploader.destroy(publicId)
      console.log("Deleted from cloudinary , Public id",publicId)
    } catch (error) {
        console.log("Error deleting from cloudinary", error)
    }
}

export {uploadOnCloudinary}