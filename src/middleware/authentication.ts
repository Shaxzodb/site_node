import jwt from 'jsonwebtoken';
async function AuthToken(req: any, res: any, next: any) {


    try {
        //req.cookies['x-auth-token']
        //if (req.signedCookies['x-auth-token']){
        const token = await jwt.verify(req.signedCookies['x-auth-token'], `${process.env.PRIVATE_KEY}`)
        res.locals.user=Object(token)
        
        //console.log(req.url=='/login');
        await next()

    } catch (err) {

        await res.status(403).redirect('/login')
    }

}
export default AuthToken;