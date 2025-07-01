import mongoose from "mongoose";
import {  DBNAME } from "../utils/constant.js"; 

const ConnectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGO_URI}/${DBNAME}`)
        console.log("Database connected successfully",connectionInstance.connection.host)
    } catch (error) {
        console.log("Failed to Connect Database")
    }

}

export default ConnectDB