// require('dotenv').config({path:'./env'})

import dotenv from 'dotenv'
import express from 'express'
import connectDB from "./db/index.js"

dotenv.config({
    path:'./env'
})

connectDB()
const app = express()

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})