const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://ran:050627@ran.agxxa.mongodb.net/blogDB?retryWrites=true&w=majority", {useNewUrlParser:true});
const app = express();
var _ = require('lodash');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const homeStartContent =  "hello welcome to my home";
const aboutContent = "This is the about info";
const contactContent = "Please contact me trough my email";
let postList=[];
const postSchema = {
    title: String,
    content: String
};
const Post = mongoose.model("Post",postSchema);

app.get("/",function(req,res) {
    Post.find({},function(err,posts) {
        res.render(
            "home",{
            Content:homeStartContent,
            post:posts
        });
    })
});
app.get("/about",function(req,res) {
    res.render("about",{Content:aboutContent});
});
app.get("/contact",function(req,res) {
    res.render("contact",{Content:contactContent});
})
app.get("/compose", function(req,res) {
   
    res.render("compose");
});
app.post("/compose", function(req,res) {
    const post = new Post({
        title:req.body.title,
        content: req.body.postBody
    });
    post.save(function(err){
        if(!err) {
            res.redirect("/");
        }
    });
    
});
app.get("/posts/:postId",(req,res)=>{
    const reqPostId = req.params.postId;
    Post.findOne({_id:reqPostId}, function(err,post) {
        res.render("post",{
            title:post.title,
            content:post.content
        });
    });
   

});
app.get("/login",(req,res) =>{
    res.render("login");

});
app.get("/register",(req,res) =>{
    res.render("register");

});
app.listen(3001,()=>{
    console.log("Example app listening at 3001");
});