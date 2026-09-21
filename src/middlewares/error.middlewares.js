import mongoose from "mongoose";

import { APiError } from "../utils/ApiError";


const errorHandler = (err , req , res , next) => {
    let error = err
    
    if(!(error instanceof APiError)){
        const statusCode = error.statusCode || error instanceof monggose.Error ? 400 : 500

        const message = error.message || "Something went wrong"
        erro = new APiError(statusCode , message , error?.errors || [] , err.stack)


    }

    const response = {
        ...error,
        message : error.message,
        ...(process.env.NODE_ENV === "development" ? {stack: error.stack} : {})

    }

    return res.status(error.statusCode).json(response)
}

export {errorHandler}