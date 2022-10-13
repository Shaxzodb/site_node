import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();
async function isLoggedIn(req:any, res:any, next:Function) {
    try {
		const token = await jwt.verify(req.signedCookies['x-auth-token'], `${process.env.PRIVATE_KEY}`);
        res.locals.isAuthentication=true
        if (req.url==='/login' || req.url==='/signup'){
            res.redirect('/')
        }
        
        await next()
        
    }catch{
        res.locals.isAuthentication=false
        await next()
    }

}
export default isLoggedIn;