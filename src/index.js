import dotenv from 'dotenv';
dotenv.config({path:'../env'})
import app from './app.js'
import { PORT } from './utils/constant.js';
import ConnectDB from './config/dbConnect.js';
import userRoutes from './routes/user.routes.js'
import cookieParser from "cookie-parser";


app.use(cookieParser());

app.use('/api/v1/users',userRoutes)
// http://localhost:5000/api/v1/users/register

ConnectDB().then(()=>{
    app.listen(PORT,()=>
    console.log(`App is listening on ${PORT}`))
}).catch((error)=>{
    console.log(`MongoDB Connection failed`,error)
})
