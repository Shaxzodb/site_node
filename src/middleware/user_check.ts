
import {User} from '../db/database'

type User = {
    _id:string
	id:string
	username: string
	password: string
    role:string,
    verified:boolean
};
async function User_Check(req:any,res:any,next:Function) {
    try{
        const user= await User.findOne<User>({
            username:req.body.username,
            password:req.body.password
        }).select({verified:1});
        if(user){
            if (user?.verified){
                await next()
            }else{
                res.render('login',{error:"Birinchi Emailingizni Tastiqlang",cookies:false})
            }
        }else{
            res.render('login',{error:"Username Yoki Password Xato",cookies:false})
        }
        
    }catch
    {
        await next()
    }
    
    
}

export default User_Check;
