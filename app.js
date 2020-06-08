/////////////INCLUDE PACKAGES/////////////

var methodOverride = require("method-override");
var sanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var express = require("express");
var app = express();

////////////APP CONFIG/////////////////////

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(sanitizer());

////////////DATABASE SETUP////////////////

mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://127.0.0.1:27017/restful_blog", { useNewUrlParser: true });

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});

var Blog = new mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
//     body: "This is a test blog."
// });

////////////ROUTES///////////////////////

app.get("/", (request, response) => {
    response.redirect("/blogs");
});


app.get("/blogs", (request, response) => {
    Blog.find({}, (error, blogs) => {
        error ? console.log("smth went wrong... \n" + error) : response.render("index", { allBlogs: blogs });
    });
});

app.get("/blogs/new", (request, response) => {
    response.render("new");
});

// CREATE
app.post("/blogs", (request, response) => {
    request.body.blog.body = request.sanitize(request.body.blog.body);
    Blog.create(request.body.blog, (error, newBlog) => {
        error ? console.log("smth went wrong... \n" + error) : response.redirect("/blogs");
    });
});

// SHOW ROUTE
app.get("/blogs/:id", (request, response) => {
    var id = request.params.id;
    Blog.findById(id, (error, blogFound) => {
        error ? response.render("/blogs") : response.render("show", { blog: blogFound });
    });
});


// EDIT
app.get("/blogs/:id/edit", (request, response) => {
    Blog.findById(request.params.id, (error, blogFound) => {
        error ? response.render("/blogs") : response.render("edit", { blog: blogFound })
    });
});


// UPDATE
app.put("/blogs/:id", (request, response) => {
    request.body.blog.body = request.sanitize(request.body.blog.body);
    Blog.findByIdAndUpdate(request.params.id, request.body.blog, (error, blogToUpdate) => {
        error ? response.render("/blogs") : response.redirect("/blogs/" + request.params.id);
    });
});

// DELETE
app.delete("/blogs/:id", (request, response) => {
    Blog.findByIdAndRemove(request.params.id, request.body.blog, (error, blogToDelete) => {
        error ? response.redirect("/blogs") : response.redirect("/blogs");
    });
});

//////////SERVER SETUP//////////////////
app.listen(3000, () => {
    console.log("Server is up and running on port: 3000.");
});
