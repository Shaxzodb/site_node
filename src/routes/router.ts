import type { Request, Response } from 'express';
import { Router } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { User, Article, Token, Comment } from '../db/database';
import isAuthorization from '../middleware/authorization';
import _ from 'lodash';
import { ArticleValidate, CommentValidate } from '../middleware/validate';
import { v4 as uuid } from 'uuid';
import User_Check from '../middleware/user_check';
import Validate_Email from '../middleware/nodemailer_validate';
import upload from '../middleware/uploadFile';
import ms from "ms"
import isLoggedIn from '../middleware/logged';
// Import crypto from 'crypto';
import dotenv from 'dotenv';
import AuthToken from '../middleware/authentication';
import Profile from '../middleware/profile';
import NotFound from "../middleware/notFound";
const router = Router();



dotenv.config();
router.get('/', [isAuthorization, Profile, isLoggedIn], async (req: Request, res: Response) => {

	res.render('index')

})
router.get('/about', [isAuthorization, Profile, isLoggedIn], async (req: Request, res: Response) => {

	res.render('about')

})

router.get('/articles/:page', [isLoggedIn, AuthToken, Profile, isAuthorization], async (req: Request, res: Response, next: Function) => {

	let perPage = 5;
	let page = Number(req.params.page) || 1;

	await Article
		.find({})
		.sort({ date: -1 })
		.skip((perPage * page) - perPage)
		.limit(perPage)
		// .populate('author', 'username')
		.populate('author', ['username', 'id'])
		.exec(async function (err, products) {
			await Article.count().exec(async function (err, count) {
				if (err) return next(err)
				if (Math.ceil(count / perPage) < Number(page)) {
					res.status(404).render('404', { url: req.headers.host + req.url });
				} else {

					res.render('articles', {
						articles: products,
						current: page,
						pages: Math.ceil(count / perPage),
					})
				}
			})
		})

});

type User = {
	_id: string
	id: string
	username: string
	password: string
	role: string
};
router.get('/login', [isLoggedIn, Profile, isAuthorization], async (req: Request, res: Response) => {

	res.status(200).render('login', { error: '' });



}).post('/login', [isLoggedIn, Profile, User_Check, isAuthorization], async (req: Request, res: Response) => {

	const user = await User.findOne<User>(
		{
			username: req.body.username,
			password: req.body.password,
		},
	).select({ _id: 1, username: 1, role: 1, id: 1 });

	if (user) {
		const token_jwt = await jwt.sign({ _id: user._id, username: user.username, role: user.role, id: user.id }, `${process.env.PRIVATE_KEY}`, {
			expiresIn: "2d",

			// ExpiresIn: "10h" // it will be expired after 10 hours
			// expiresIn: "20d" // it will be expired after 20 days
			// expiresIn: 120 // it will be expired after 120ms
			// expiresIn: "120s" // it will be expired after 120s

		});
		res.cookie('username', user.id, {
			maxAge: ms("2d"),
			secure: true,
			sameSite: 'lax',
		});
		res.cookie('x-auth-token', token_jwt, {
			httpOnly: true,
			maxAge: ms("2d"),
			secure: true,
			sameSite: 'lax',
			signed: true,
		})

		res.status(200)
			.redirect('/');
	} else {
		res.status(401).render('login', { error: 'User yoke password xato!' });
	}




});

router.get('/profile/:auth_id', [Profile, isLoggedIn, isAuthorization], async (req: Request, res: Response, next: Function) => {
	const AccountId = req.params.auth_id;
	const user = await User.findOne({ id: AccountId })
		.select({ _id: 0, __v: 0, password: 0, id: 0 })
		.exec(async (err, account) => {

			if (err) await next(err)
			if (!account) {
				res.status(404).render('404', { url: req.headers.host + req.url });
			} else {
				res.render('profile', {
					user: account
				})
			}

		})
	// if(!user){
	// 	res.status(404).render('404', { url: req.headers.host + req.url });
	// }else{
	// 	res.render('profile', {
	// 		user
	// 	})
	// }
});

router.get('/signup', [Profile, isLoggedIn, isAuthorization], async (req: Request, res: Response) => {

	res.status(200).render('signup', { error: '' });

}).post('/signup', [Validate_Email, Profile, isLoggedIn], async (req: Request, res: Response) => {
	res.status(200).redirect('/login');
});
router.delete('/logout', async (req: Request, res: Response) => {
	res.clearCookie('username');
	res.clearCookie('x-auth-token').redirect('/login');
});


router.get('/create_article', [isLoggedIn, Profile, AuthToken, isAuthorization], async (req: Request, res: Response) => {

	const role = await res.locals.user.role;
	if (role === 'super_admin' || role === 'admin') {
		res.render('create_article', { error: '' });
	} else {
		res.status(404).render('404', { url: req.headers.host + req.url });
	}
}).post('/create_article', [isLoggedIn, Profile, AuthToken, isAuthorization], async (req: Request, res: Response) => {

	const role = await res.locals.user.role;

	if (role === 'super_admin' || role === 'admin') {
		upload(req, res, async err => {
			try {
				if (err instanceof multer.MulterError) {
					// A Multer error occurred when uploading.
					// await res.render('create_article', { error: err })
					throw err;
				} else if (err) {
					// An unknown error occurred when uploading.
					// await res.render('create_article', { error: "An unknown error occurred when uploading." })
					throw new Error('An unknown error occurred when uploading.');
				}

				req.body.author = await res.locals.user._id;
				req.body.img = await req.file?.filename;
				const { error } = await ArticleValidate.validate(
					_.pick(req.body, ['title', 'content', 'img', 'author', 'direction']),
				);
				if (!error) {
					// Everything went fine.
					const article = await new Article(
						Object.assign(
							_.pick(req.body, ['title', 'content', 'img', 'author', 'direction']), { id: uuid(), date: new Date() },
						),
					);
					await article.save();
					const message = 'Article created successfully';
					res.status(200).cookie('message', message).redirect(`/detail_article/${article.id}`);
				} else {
					res.status(406).render('create_article', { error: error.message, });
				}
			} catch (err) {
				res.render('create_article', { error: err, isAuthentication: res.locals.isAuthentication });
			}
		});
	} else {
		res.status(404).render('404', { url: req.headers.host + req.url });
	}
});

router.get('/detail_article/:id', [Profile, isLoggedIn, AuthToken, isAuthorization], async (req: Request, res: Response) => {

	
	

	
	await Article.findOne(
		{
			id: req.params.id,
		},
	)
		.populate('author', 'username')
		.select({ _id: 0, __v: 0 })

		.exec(async function (err, article) {
			await Article.find({
				direction: Object(article).direction
			})
				.sort({ date: -1 })
				.limit(5)
				.exec(async function (err, products) {

					await Comment.find({article:req.params.id}).sort({ date: -1 }).exec(async(err,comments)=>{
						if (article) {
							const { message } = req.cookies;
							if (message) {
								res.status(200).clearCookie('message').render('detail_article', {
									articles: products,
									article,
									message,
									comments
								});
							} else {
								res.status(200).render('detail_article', {
									articles: products,
									article,
									message: '',
									comments
								});
							}
						} else {
							res.status(404).render('404', { url: req.headers.host + req.url });
						}
					})


				})

		});
}).delete('/detail_article/:id', [isLoggedIn, AuthToken, isAuthorization], async (req: Request, res: Response) => {

	const role = await res.locals.user.role

	if (role === 'super_admin' || role === 'admin') {
		const delete_article_id = req.params.id;
		await Article.deleteOne({ id: delete_article_id })
		res.status(200).redirect('/articles/1')
	} else {
		res.status(404).render('404', { url: req.headers.host + req.url });
	}


}).post('/detail_article/:id', [isLoggedIn, AuthToken, isAuthorization], async (req: Request, res: Response) => {
	if(req.body.message){
		req.body.article = req.params.id
		req.body.author = res.locals.user.username;
		const { error } = await CommentValidate.validate(
			_.pick(req.body, ['message','author','article']),
		);
		
		if (!error) {
			await new Comment(
				Object.assign(
					_.pick(req.body, ['message','author','article']), { id: uuid(), date: new Date() },
				),
			).save()
			
		}
	}
	
	
	

	
	await Article.findOne(
		{
			id: req.params.id,
		},
	)
		.populate('author', 'username')
		.select({ _id: 0, __v: 0 })

		.exec(async function (err, article) {
			await Article.find({
				direction: Object(article).direction
			})
				.sort({ date: -1 })
				.limit(5)
				.exec(async function (err, products) {

					await Comment.find({article:req.params.id}).sort({ date: -1 }).exec(async(err,comments)=>{
						if (article) {
							const { message } = req.cookies;
							if (message) {
								res.status(200).clearCookie('message').render('detail_article', {
									articles: products,
									article,
									message,
									comments
								});
							} else {
								res.status(200).render('detail_article', {
									articles: products,
									article,
									message: '',
									comments
								});
							}
						} else {
							res.status(404).render('404', { url: req.headers.host + req.url });
						}
					})


				})

		});
	
	
	
})
router.get('/update/:id', [Profile, isLoggedIn, AuthToken, isAuthorization], async (req: Request, res: Response) => {

	const role = await res.locals.user.role

	if (role === 'super_admin' || role === 'admin') {
		await Article.findOne({ id: req.params.id })
			.select({ _id: 0, __v: 0 })
			.exec(async function (err, article) {
				if (article) {
					res.status(200).render('update', {

						article,
						error: ''

					});
				} else {
					res.status(404).render('404', { url: req.headers.host + req.url });
				}
			})
	} else {
		res.status(404).render('404', { url: req.headers.host + req.url });
	}
}).put('/update/:id', [isLoggedIn, AuthToken, isAuthorization], async (req: Request, res: Response) => {
	const token = await jwt.verify(req.signedCookies['x-auth-token'], `${process.env.PRIVATE_KEY}`);
	const role = await Object(token).role;
	const art = await Article.findOne({ id: req.params.id })
		.select({ _id: 0, __v: 0 })
	if (role === 'super_admin' || role === 'admin') {

		upload(req, res, async err => {
			try {
				if (err instanceof multer.MulterError) {
					// A Multer error occurred when uploading.
					// await res.render('create_article', { error: err })
					throw err;
				} else if (err) {
					// An unknown error occurred when uploading.
					// await res.render('create_article', { error: "An unknown error occurred when uploading." })
					throw new Error('An unknown error occurred when uploading.');
				}


				req.body.img = await req.file?.filename;

				req.body.author = String(Object(art).author)

				// const { error } = await ArticleValidate.validate(
				// 	_.pick(req.body, ['title', 'content', 'img', 'author', 'direction']),
				// );
				// if (!error) {
				// Everything went fine.
				await Article.updateOne({ id: req.params.id }, {
					$set: {
						title: req.body.title,
						content: req.body.content,
						img: req.body.img,
						direction: req.body.direction
					}
				})
				const message = 'Article modified successfully';
				res.status(200).cookie('message', message).redirect(`/detail_article/${Object(art).id}`);
				// } else {
				// 	res.status(406).render('update', {article:art, error: error.message, });
				// }
			} catch (err) {


				req.body.author = String(Object(art).author)

				// const { error } = await ArticleValidate.validate(
				// 	_.pick(req.body, ['title', 'content', 'img', 'author', 'direction']),
				// );
				// if (!error) {
				// Everything went fine.
				await Article.updateOne({ id: req.params.id }, {
					$set: {
						title: req.body.title,
						content: req.body.content,

						direction: req.body.direction
					}
				})
				res.render('update', { article: art, error: err, isAuthentication: res.locals.isAuthentication });
			}
			//}
		});



	} else {
		res.status(404).render('404', { url: req.headers.host + req.url });
	}
})


router.get("/verify/:id/:token", async (req, res) => {

	try {

		const user = await User.findOne({ _id: req.params.id });

		if (!user) return res.status(400).send("Invalid link");

		const token = await Token.findOne({
			userId: user._id,
			token: req.params.token,
		});
		if (!token) return res.status(400).send("Invalid link");

		await User.updateOne({ _id: user._id }, {
			$set: {
				verified: true
			}
		})


		await Token.findOneAndRemove(token._id)



		res.send("<center><h1>Email verified successfully ✅</h1></center>");
	} catch (error) {
		res.status(400).send("An error occured");
	}
});

router.use([isLoggedIn, Profile, AuthToken, isAuthorization], NotFound);
export default router;
