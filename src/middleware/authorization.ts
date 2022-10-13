import jwt from 'jsonwebtoken';
async function isAuthorization(req: any, res: any, next: any) {


    try {
        //req.cookies['x-auth-token']


        const token = await jwt.verify(req.signedCookies['x-auth-token'], `${process.env.PRIVATE_KEY}`)


        if (Object(token).role == 'admin' || Object(token).role == 'super_admin') {
            res.locals.admin = true
        } else {
            res.locals.admin = false
        }
       

        await next()
    } catch (err) {

        res.locals.admin = false
        await next()
    }


}
export default isAuthorization;