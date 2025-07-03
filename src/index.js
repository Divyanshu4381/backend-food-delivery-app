import dotenv from 'dotenv';
dotenv.config({path:'../env'})
import { PORT } from './utils/constant.js';
import ConnectDB from './config/dbConnect.js';
import userRoutes from './routes/user.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import cors from "cors"
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";
import { createServer } from "http";
import express from 'express';
const app=express();

const httpServer = createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.BASE_URL,
      "http://localhost:3000",
      "http://192.168.0.1:3000",
    ];

    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d{4}$/.test(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const io=new Server(httpServer,cors(corsOptions))
app.use(express.json());
app.use(cors(corsOptions))
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))



app.use('/api/v1/users',userRoutes)
app.use('/api/v1/category',categoryRoutes)
app.use('/api/v1/product',productRoutes)
app.use('/api/v1/cart',cartRoutes)
app.use('/api/v1/order',orderRoutes)
// http://localhost:5000/api/v1/users/register

ConnectDB().then(()=>{
    app.listen(PORT,()=>
    console.log(`App is listening on ${PORT}`))
}).catch((error)=>{
    console.log(`MongoDB Connection failed`,error)
})
