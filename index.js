const express = require('express')
const connect = require('./database')
const app = express();
 
connect();

//for uer_routes
const userRoute = require('./routes/userRoutes')
app.use("/",userRoute)

const adminRoute = require('./routes/adminRoutes')
app.use("/admin",adminRoute)

app.listen(2000,()=>{
    console.log("Server is running on port 2000")
})