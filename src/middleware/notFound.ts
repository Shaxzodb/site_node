async function NotFound(req: any, res: any) {
	res.status(404);
	// respond with html page
	if (req.accepts("html")) {
		return await res.render("404", { url: req.headers.host + req.url });
	}
	// respond with json
	if (req.accepts("json")) {
		return await res.json({ error: "Not found" });
	}
	// default to plain-text. send()
	return await res.type("txt").send("Not found");
}
export default NotFound;