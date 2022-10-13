import jwt  from "jsonwebtoken";
export default async function Profile(req:any,res:any,next:Function) {
    try{
        const token = await jwt.verify(req.signedCookies['x-auth-token'], `${process.env.PRIVATE_KEY}`);
    res.locals.id=Object(token).id
    await next()
    }
    catch{
        res.locals.id=false
        await next()
    }
}