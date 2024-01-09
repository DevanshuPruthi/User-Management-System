const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const randomString = require('randomstring')
const nodeMailer = require('nodemailer')



const securePassword = async(password)=>{
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        return hashedPassword;
    } catch (error){
        console.log(error.message)
    }
    }


    const addUserMail = async(name, email,password,user_id)=>{
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
                subject: "Admin Added you, Please verify your mail",
                html:'<p> Hii '+name+', please click here to <a href="https://usermanagement-h4vq.onrender.com/verify?id='+user_id+'"> Verify  </a> your mail. </p> <br> <b> Email:- </b>'+email+'<br> <b>Password:- </b>'+password+''
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
        
    

const sendResetPassword = async(name, email,token)=>{
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
            html:'<p> Hii '+name+', please click here to <a href="https://usermanagement-h4vq.onrender.com/admin/forget-password?token='+token+'"> Reset  </a> your    Password. </p>'
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
    


const loadLogin = async(req,res) =>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}


const verifyLogin = async(req,res) =>{
    try {
       const email = req.body.email;
       const password = req.body.password;

     const userData = await User.findOne({email:email})
       if(userData){
         const passwordMatched = await bcrypt.compare(password,userData.password)
         if(passwordMatched){
            if(userData.is_admin === 0)
            {
                res.render('login',{message:"Email or Password is Incorrect"})
            }
            else{
                req.session.user_id = userData._id;
                res.redirect('/admin/home')
            }
         }
         else{
            res.render('login',{message:"Email or Password is Incorrect"});
         }
       }
       else{
        res.render('login',{message:"Email or Password is Incorrect"});
       }
    } catch (error) {
        console.log(error.message)
    }
}


const loadDashboard = async(req,res) =>{
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.render('home',{admin:userData})
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req,res) =>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

const forgetLoad = async(req,res) =>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}

const forgetVerify = async(req,res) =>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email:email})

        if(userData)
        {
            if(userData.is_admin === 0)
            {
                res.render('forget',{message:"User not found"})
            }
            else
            {
                const random_string = randomString.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:random_string}})
                sendResetPassword(userData.name,userData.email,random_string);
                res.render('forget',{message:"Please check your mail to reset your password"})
            }
        }
        else
        {
            res.render('forget',{message:"User not found"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const forgetPasswordLoad = async(req,res) =>{
    try {
        const token = req.query.token;

        const tokenData =  await User.findOne({token:token})

        if(tokenData)
        {
            res.render('forget-password',{user_id:tokenData._id})
        }
        else{
            res.render("404",{message:"Invalid link"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const adminResetPassword = async(req,res) =>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password)
        const updatedData = await User.findOneAndUpdate({_id:user_id},{$set:{password:secure_password,token:""}})

        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}


const adminDashboard = async(req,res) =>{
    try {

        const userData = await User.find({is_admin:0})

        res.render('dashboard',{users:userData})
    } catch (error) {
        console.log(error.message)
    }
}

const newUserLoad = async(req,res) =>{
    try {
        res.render('new-user')
    } catch (error) {
        console.log(error.message)
    }
}

const addNewUser = async(req,res) =>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const image = req.file.filename;
        const password = randomString.generate(8);
        const secure_passowrd = await securePassword(password)

        const user = new User({
            name:name,
            email:email,
            mobile:mobile,
            image:image,
            password:secure_passowrd,
            is_admin:0
        })

        const userData = await user.save();

        if(userData)
        {
            addUserMail(userData.name,userData.email,password,userData._id)
            res.redirect('/admin/dashboard')
        }
        else{
            res.render('new-user',{message:"Something went wrong"})
        }

    } catch (error) {
        console.log(error.message)
    }
}
const editUserLoad = async(req,res) =>{
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id})

        if(userData)
        {
            res.render('edit-user',{user:userData})
        }
        else{
            res.redirect('/admin/dashboard')
        }

       
    } catch (error) {
        console.log(error.message)
    }
}

const updateUser = async(req,res) =>{
    try {
        const uptadedData = await User.findOneAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,is_varified:req.body.verify}})
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}

const deleteUser = async(req,res) =>{
    try {
        const id = req.query.id;
        await User.deleteOne({_id:id})
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    adminResetPassword,
    adminDashboard,
    newUserLoad,
    addNewUser,
    editUserLoad,
    updateUser,
    deleteUser
}