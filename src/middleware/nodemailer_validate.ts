import nodemailer from "nodemailer";
import { UserValidate } from "./validate";
import crypto from "crypto";
import { User, Token } from '../db/database';
import { v4 as uuid } from 'uuid';
import _ from "lodash";
async function Validate_Email(req: any, res: any, next: any) {

    try {
        const user = await User.findOne({
            username: req.body.username
        }).select({ _id: 1 });

        if (!user) {
            const { error } = await UserValidate.validate(
                _.pick(req.body, ['username', 'password', 'email', 'phone', 'address']),
            );
            if (!error) {

                const user = await new User(
                    Object.assign(
                        _.pick(req.body, ['username', 'password', 'email', 'phone', 'address']), { id: uuid() },
                    ),
                ).save();
                let token = await new Token({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();


                var transporter = await nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'shaxzodbmaster@gmail.com',
                        pass: `${process.env.PASS}`
                    }
                });

                var mailOptions = {
                    from: 'shaxzodbmaster@gmail.com',
                    to: `${req.body.email}`,
                    subject: `Tastiqlash Xabari!`,
                    html: `<h1><center>Email Tastiqlash Xabari!</center></h1>\
                <br/><hr/>\
                <p>Salom ${req.body.username} Emailingizni Tastiqlashingizni Suraymiz </p>
                <p>👉 ${req.hostname}/verify/${user._id}/${token.token}</p> <br/><center>
                <img src="https://media.istockphoto.com/photos/mountain-landscape-picture-id517188688?b=1&k=20&m=517188688&s=612x612&w=0&h=x8h70-SXuizg3dcqN4oVe9idppdt8FUVeBFemfaMU7w=" width="500px" alt="XATO" /></center>`,
                    //text:"one"
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                await next();
            }
            else {
                res.status(406).render('signup', { error: error.message });
            }



        } else {
            await res.status(406).render('signup', { error: "Bunday Foydalanuvchi Ruyhatdan o\'tgan" });
        }


    } catch {
        await res.status(406).render('signup', { error: "Nomalum Xato!" });
    }
}
export default Validate_Email;