class APiError extends Error{
    constructor
        (statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.messge = message
        this.success =  false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constuctor  )
        }
    }
    
}

export { APiError}