const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodeMailer = require('nodemailer')
const mongoose = require('mongoose')
const randomString = require('randomstring')

const securePassword = async(password)=>{
try {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword;
} catch (error){
    console.log(error.message)
}
}


const sendVerifyMail = async(name, email,user_id)=>{
try {
    const transporter = await nodeMailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:"csecec.1802028@gmail.com",
            pass:"zmgq dhpu alke ssog"
        }
    })

    const mailOptions = {
        from:"csecec.1802028@gmail.com",
        to:email,
        subject: "For Verfication of user Management System",
        html:'<p> Hii '+name+', please click here to <a href="http://localhost:2000/verify?id='+user_id+'"> Verify  </a> your mail. </p>'
    }
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error.message)
        }
        else
        {
            console.log("Email sent",info.response)
        }
    })
} catch (error) {
    console.log(error.message)
}
}

const sendResetPasswordMail = async(name, email,token)=>{
    try {
        const transporter = await nodeMailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:"csecec.1802028@gmail.com",
                pass:"zmgq dhpu alke ssog"
            }
        })
    
        const mailOptions = {
            from:"csecec.1802028@gmail.com",
            to:email,
            subject: "For Rset Password",
            html:'<p> Hii '+name+', please click here to <a href="http://localhost:2000/forget-password?token='+token+'"> Reset  </a> your    Password. </p>'
        }
        await transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error.message)
            }
            else
            {
                console.log("Email sent",info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
    }
    


const SignUp = async(req,res)=>{
    try {
        res.render('signUp')
    } catch (error) {
        console.log(error)
    }
}

const createUser = async (req, res) => {
    try {
        const hashedPassword = await securePassword(req.body.password);

        const userData = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file.filename,
            password: hashedPassword,
            is_admin: 0,
        });

        const user = await userData.save();

        if (user) {
            sendVerifyMail(req.body.name, req.body.email, user._id);
            res.render("signUp", { message: "User registered. Please verify your email." });
        } else {
            res.render("signUp", { message: "User registration failed." });
        }
    } catch (error) {
        console.error("Error during user registration:", error.message);
        res.render("signUp", { message: "An error occurred during registration." });
    }
};

const verifyMail = async(req,res)=>{
    try {
       const updatedInfo =  await User.updateOne({_id:req.query.id},{$set:{is_varified:1}})
       console.log(updatedInfo)
       res.render("emailVerified");
    } catch (error) {
        console.log(error.message)
    }

}

const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if(userData)
        {
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_varified===0){
                    res.render('login',{message:"please verify your email"})
                }
                else{
                    req.session.user_id = userData._id;
                    res.redirect('/home')
                }
            }
            else{
                res.render('login',{message:"email or password is incorrect"})
            }
        }
        else{
            res.render('login',{message:"email or password is incorrect"})
        }

    } catch (error) {
        console.error("Error during login:", error.message);
        res.render("login", { message: "An error occurred during login." });
    }
};

const   loadHome = async(req,res)=>{
    try {

        const userData = await User.findById({_id:req.session.user_id})
        res.render("home",{user:userData})
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
    }
}
const forgetLoad = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}

const forgetpassword = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email:email})

        if(userData){
            if(userData.is_varified===0)
            {
                res.render('forget',{message:"Please verify your mail"})
            }
            else
            {
                const resetToken = randomString.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:resetToken}})
                sendResetPasswordMail(userData.name,userData.email,resetToken)
                res.render('forget',{message:"Please check you email to reset password"})
            }
        }
        else{
            res.render('forget',{message:"user email is incorrect"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const forgetPasswordLoad = async(req,res)=>{
try {
    const token = req.query.token;
    const tokenData = await User.findOne({token:token})
    if(tokenData){
        res.render('forget-password',{user_id:tokenData._id})
    }
    else{
        res.render('404',{message:"token is invalid"})
    }
} catch (error) {
    console.log(error.message)
}
}

const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id && req.body.user_id.trim();

        if (!user_id) {
            return res.status(400).send("Invalid user ID");
        }

        const secure_password = await securePassword(password);
        const updatedPassword = await User.findOneAndUpdate(
            { _id: user_id },
            { $set: { password: secure_password, token: "" } },
            { new: true }
        );

        if (updatedPassword) {
            return res.redirect("/");
        } else {
            return res.status(404).send("User not found");
        }
    } catch (error) {
        console.log("Error resetting password:", error.message);
        return res.status(500).send("Internal Server Error");
    }
};

const editProfileLoad = async(req,res) =>{
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id})

        if(userData)
        {
            res.render('edit',{user:userData})
        }
        else{
            res.redirect('/home')
        }


    } catch (error) {
        console(error.message)
    }
}

const updateProfile = async(req,res)=>{
    try {
        if(req.file){
            const userData = await User.findOneAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,image:req.file.filename}},{new:true})
        }
        else{
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}},{ new: true })
        }
        res.redirect('/home')
        
    } catch (error) {
        console(error.message)
    }
}

module.exports={
    SignUp,
    createUser,
    verifyMail,
    loadLogin,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetpassword,
    sendResetPasswordMail,
    forgetPasswordLoad,
    resetPassword,
    editProfileLoad,
    updateProfile
}

