import { ApiResponse } from "../utils/ApiRespons.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const healthcheck = asyncHandler( async ( req , res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, "OK", " HEalthCheck passed"))
})
   

export{healthcheck}