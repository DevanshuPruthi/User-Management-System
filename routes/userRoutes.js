const express = require('express');
const { SignUp, createUser, verifyMail, loadLogin, verifyLogin, loadHome,userLogout, forgetLoad, forgetpassword, forgetPasswordLoad, resetPassword, editProfileLoad, updateProfile } = require('../controller/userController');
const user_Route = express();
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path');
const session = require('express-session')




user_Route.use(session({
    secret: 'HeyMyNameIsDevanshu', 
    resave: false, 
    saveUninitialized: false,
}));

user_Route.use(express.static('public'))

const storage = multer.diskStorage({
    destination:function(req,file,cb) {
        cb(null,path.join(__dirname,'../public/userImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+"-"+file.originalname;
        cb(null,name)
    }
})

const upload = multer({storage:storage})

user_Route.use(express.static(path.join(__dirname, '../public')))


const auth = require("../middleware/auth");
const exp = require('constants');


user_Route.use(bodyParser.json())
user_Route.use(bodyParser.urlencoded({extended:true}))


user_Route.set('view engine', 'ejs');
user_Route.set('views','./views/users')


user_Route.get('/signUp',auth.isLogout,SignUp)
user_Route.post('/createUser',upload.single('image'),createUser)
user_Route.get('/verify',verifyMail)
user_Route.get('/',auth.isLogout,loadLogin)
user_Route.get('/login',auth.isLogout,loadLogin)
user_Route.post('/login',verifyLogin)
user_Route.get('/home',auth.isLogin,loadHome)
user_Route.get('/logout',auth.isLogin,userLogout)
user_Route.get('/forget',auth.isLogout,forgetLoad)
user_Route.post('/forget',forgetpassword)
user_Route.get("/forget-password",auth.isLogout,forgetPasswordLoad)
user_Route.post("/forget-password",resetPassword)
user_Route.get("/edit",auth.isLogin,editProfileLoad)
user_Route.post("/edit",upload.single('image'),updateProfile)

// user_Route.get('*', function(req,res) {
//     res.redirect('/login');
//     })

module.exports = user_Route;