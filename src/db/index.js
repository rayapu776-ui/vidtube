import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDb = async () =>{
    try {
         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

         console.log(`\n MOngoBD conected ! DB host : $ {connectionInstance.connection.host}`);
         
    } catch (error) {
        console.log("MongoDB Connection error",error)
        process.exit(1)
    }
}


export default connectDb; 