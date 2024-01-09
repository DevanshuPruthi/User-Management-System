const adminIsLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            next();
        }
        else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const adminIsLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id)
        {
            res.redirect('/admin/home')
        }
        else{
            next();
        }
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {adminIsLogin,adminIsLogout}