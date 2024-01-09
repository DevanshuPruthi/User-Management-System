const express = require('express')
const admin_route = express();

const multer = require('multer')
const path = require('path');

admin_route.use(express.static('public'))
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

const session = require('express-session')
admin_route.use(session({
    secret: 'HeyMyNameIsDevanshu', 
    resave: false, 
    saveUninitialized: false,
}));
const bodyParser = require('body-parser');
const { loadLogin, verifyLogin, loadDashboard, logout, forgetLoad, forgetVerify, forgetPasswordLoad, adminResetPassword, adminDashboard, newUserLoad, addNewUser, editUserLoad, updateUser, deleteUser } = require('../controller/adminController');



admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}))

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const adminAuth = require("../middleware/adminAuth")



admin_route.get('/',adminAuth.adminIsLogout,loadLogin)
admin_route.post('/',verifyLogin);
admin_route.get("/home", adminAuth.adminIsLogin,loadDashboard);
admin_route.get('/logout',adminAuth.adminIsLogin,logout )
admin_route.get('/forget',adminAuth.adminIsLogout,forgetLoad )
admin_route.post('/forget', forgetVerify)
admin_route.get('/forget-password',adminAuth.adminIsLogout,forgetPasswordLoad)
admin_route.post('/forget-password', adminResetPassword)
admin_route.get("/dashboard",adminAuth.adminIsLogin, adminDashboard)
admin_route.get("/new-user",adminAuth.adminIsLogin,newUserLoad)
admin_route.post("/new-user",upload.single('image'),addNewUser)
admin_route.get("/edit-user",adminAuth.adminIsLogin,editUserLoad)
admin_route.post('/edit-user',updateUser)
admin_route.get('/delete-user',deleteUser)



admin_route.get('*', function(req,res) {
    res.redirect('/admin');
    })



module.exports = admin_route