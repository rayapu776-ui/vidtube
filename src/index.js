import dotenv from "dotenv"
import { app } from "./app.js";
import connectDb from "./db/index.js";


dotenv.config({
    path : "./.env"
})
const PORT = process.env.PORT || 8001

connectDb()
.then(()=>{
    app.listen(PORT, () =>{
        console.log(`Server is running on port ${PORT}`)
    })
})
.catch((err)=>{
    console.log("MOngoDB connection error",err)
})