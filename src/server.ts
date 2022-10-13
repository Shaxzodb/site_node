import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import ejs from 'ejs';
import methodOverride from "method-override";
import NotFound from "./middleware/notFound";
//import corsOptionsDelegate from "./middleware/cors";

import router from "./routes/router";
const app = express();
// import { createServer } from "node:http";
// const http = createServer(app);



app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(compression()); // for compressing response bodies
app.use(cookieParser('@K3mMdbME0'));
app.set("view engine", "ejs");
app.engine('html', ejs.renderFile);
app.use("/static",express.static("static"));
app.use('/uploads/',express.static("uploads"));
app.use(methodOverride('_method'))
if (app.get("env") === "development") {
	app.use(morgan("tiny")); // for logging requests
	
	
} 
// else {
// 	app.use(helmet()); // for logging and security
// 	app.enable("trust proxy"); // trust proxy is a method of express that allows you to set the value of req.ips to the IP address of the proxy that connected to your app.
// 	app.use((req, res, next) => {
// 		if (req.secure) {
// 			next();
// 		} else {
// 			res.redirect("https://" + req.headers.host + req.url);
// 		}
// 	});
// }


// app.use(cors({
// 	origin:"http://127.0.0.1:5500",
// 	credentials: true,
// }))
app.use(cors());
app.use( router);
app.use(NotFound);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is starting on port ${PORT}...`);
});
