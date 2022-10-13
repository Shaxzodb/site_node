import Joi from "joi";
import _ from 'lodash';
// type UserValidateType = {
//     username: string;
//     password: string;
//     email: string;
//     phone: string;
//     address: string;
// }

const UserValidate = Joi.object({
    username: Joi.string().required().unit("username").min(5),
    password: Joi.string().required().unit("password").min(5),
    email: Joi.string().required().email().unit("email"),
    phone: Joi.string().unit("phone").min(8).max(13)
});

// type ArticleValidateType = {
//     title: string;
//     content: string;
//     img: string;
//     author: string;
// }
const ArticleValidate = Joi.object({
    title: Joi.string().required().min(5),
    content: Joi.string().required().min(20),
    img: Joi.string().required(),
    direction: Joi.string().required(),
    author: Joi.string().required().meta({ type: 'ObjectId' }),
});
const CommentValidate = Joi.object({
    message: Joi.string().required().min(3).max(250),
    author: Joi.string().required().meta({ type: 'ObjectId' }),
    article: Joi.string().required()
});
// const ChatValidate = Joi.object({
//     message: Joi.string().required().min(2).max(250),
//     author: Joi.string().required().meta({ type: 'ObjectId' }),
//     recipient: Joi.string().required().meta({ type: 'ObjectId' }),
// });

export { UserValidate, ArticleValidate, CommentValidate };
