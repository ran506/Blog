require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
//passportlocalMongoose require passport-local dependency while don't have to be explictly require here
const passportLocalMongoose=require("passport-local-mongoose");
const app = express();
// const md5 = require("md5");
mongoose.connect("mongodb+srv://ran:050627@ran.agxxa.mongodb.net/blogDB?retryWrites=true&w=majority", {useNewUrlParser:true});
mongoose.set("useCreateIndex",true);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));
app.use(passport.initialize());
app.use(passport.session());
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
const userSchema  =new mongoose.Schema ( {
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

//only password feild , mongoose will encrypt when you save, decrypt when you find
//userSchema.plugin(encrypt, { secret: process.env.secret, encryptedFields:['password'] });
//remove this plugin to try md5
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
//serialize create cookie,
passport.serializeUser(User.serializeUser());
//use pas
passport.deserializeUser(User.deserializeUser());
// const admin = new User({
//     email:"384961093@qq.com",
//     password: "1234"
// });
// admin.save();

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
//register user
// app.post("/register", (req,res)=>{
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//         // Store hash in your password DB.
//         const newUser  = new User({
//             email : req.body.username,
//             password : hash
//         });
//         newUser.save(function(err){
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 res.render("secrets");
//             }
//         });
//     });
//     // const newUser  = new User({
//     //     email : req.body.email,
//     //     password : md5(req.body.password)
//     // });
    
// });
//login route check valid user
// app.post("/login",(req,res) =>{
//     const username = req.body.username;
//     const password = req.body.password;
    
//     User.findOne({email:username},function(err,founduser) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             if (founduser) {
//                 // if (founduser.password === password) {
//                 //     res.render("secrets");
//                 // }
//                 // the first parameter is the value passed in, the second parameter is the value stored in the database
//                 bcrypt.compare(password, founduser.password, function(err, result) {
//                     // result == true
//                     if (result === true) {
//                         res.render("secrets");
//                     }
//                     else {
//                         console.log("wrong password");
//                     }

//                 });
//             }
//         }
//     });
// });
//check session if user is log in
app.get("/secrets",(req,res)=> {
    if (req.isAuthenticated() ){
        res.render("secrets");
    }
    else {
        res.redirect("/login");
    }
});
app.post("/register",function(req,res) {
    User.register({username:req.body.username}, req.body.password,function(err,user) {
        if(err) {
            console.log(err);
            res.redirect("/register");
        }
        else{
            //authenticate this session, save your session id, coockie saved,here session is set to end when you close your browser
            passport.authenticate("local")(req,res,function()  {
                res.redirect("/secrets");
            });
        }
    });
});
app.post("/login",(req,res) => {
    const user = new User ({
        email: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err) {
        if(err) {
            console.log(err);
        }else {
            passport.authenticate("local") (req,res,function() {
                res.redirect("/secrets");
            });
        }
    });
});
app.get("/logout", (req,res) => {
    //deauthenticate user and log out session
    req.logout();
    res.redirect("/");
});
app.listen(3001,()=>{
    console.log("Example app listening at 3001");
});