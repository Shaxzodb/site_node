import mongoose from "mongoose";
import dotenv from "dotenv"; // dotenv is a module for loading environment variables from a .env file into process.env.


dotenv.config(); // load the .env file
mongoose.connect(`${process.env.MONGODB_URL}`) // connect to mongodb
    .then(() => console.log("Malumotlar Bazasiga Ulandi..."))
    .catch((err: Error) => console.log(`Malumotlar Bazasida Ulanishda Xato!: => ${err}`));

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});
const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["user", "admin", "super_admin"],
        default: "user"
    }
});

const ArticleSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        require: true,
        enum: ["DUNYO", "UZBEKISTAN", "SPORT", "IQTISODIYOT", "JAMIYAT"]
    },
    content: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    date: {
        type: Date,
        required: true
    },

});

// const ChatSchema = new mongoose.Schema({
//     id: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     message: {
//         type: String,
//         required: true,
//         maxLength: 265,
//         minLength: 1
//     },
//     author: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Users',
//         require: true
//     },
//     recipient: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Users',
//         require: true
//     },
//     date: {
//         type: Date,
//         required: true
//     }
// });
const CommentSchema = new mongoose.Schema({
    id: {
        type: String,
      
        unique: true
    },
    message: {
        type: String,
        required: true,
        maxLength: 250,
        minLength: 3
    },
    article: {
        type:String,
        required: true,
    },
    author: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        required: true
    }
});
const Article = mongoose.model("Articles", ArticleSchema);
const Comment = mongoose.model('Comments', CommentSchema);
const Token = mongoose.model("token", tokenSchema)
const User = mongoose.model("Users", UserSchema);
//const Chat = mongoose.model('Chats', ChatSchema);

export { User, Article, Comment, Token };
