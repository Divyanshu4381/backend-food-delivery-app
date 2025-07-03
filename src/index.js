import dotenv from 'dotenv';
dotenv.config({path:'../env'})
import app from './app.js'
import { PORT } from './utils/constant.js';
import ConnectDB from './config/dbConnect.js';
import userRoutes from './routes/user.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import cors from "cors"
import cookieParser from 'cookie-parser';

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d{4}$/.test(origin) || origin === `${process.env.BASE_URL}`) {
      callback(null, true); // ✅ Yeh allow karega origin ko
    } else {
      callback(new Error("Not allowed by CORS")); // ❌ Block karega
    }
  },
  credentials: true, // ✅ Yeh enable karega cookie sending
};

app.use(cors(corsOptions))
app.use(cookieParser());



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
