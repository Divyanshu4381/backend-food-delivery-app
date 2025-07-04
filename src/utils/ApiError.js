

class ApiError extends Error{
    constructor(
        statusCode,
        message="An error occurred",
        error=[],
        stack=""
    )
        {
        super(message)
        this.statusCode=statusCode,
        this.data=null,
        this.message=message,
        this.success=false,
        this.errors=error

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export default ApiError