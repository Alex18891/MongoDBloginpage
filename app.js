const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt=require("bcryptjs");
const mongoUrl = "mongodb+srv://mongo:asr232000@cluster0.uahgiie.mongodb.net/?retryWrites=true&w=majority";
const jwt = require("jsonwebtoken");
const JWT_SECRET = "hvdvay6ert72839289()fqer21df1d1dasdasfgas23112afsa";
const nodemailer = require("nodemailer");
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:false}));
mongoose.connect(mongoUrl,{
    useNewUrlParser:true
}).then(()=>{console.log("Conected to database");
})
.catch(e=>console.log(e));
require("./userDetails");
const User = mongoose.model("UserInfo");

//Register a user
app.post("/register",async(req,res)=>{
    const {name,username,email,pw,confipw} = req.body; //body request for the parameters of register 
    const encryptedPassword = await bcrypt.hash(pw,10);//encrypt the password
    const encryptedconfirmPassword = await bcrypt.hash(confipw,10);
    try{
        const oldUserem= await User.findOne({email});//see if the email has already created or used
        const oldUser= await User.findOne({username});//see if the username has already created or used
        if(oldUser || oldUserem)
        {
          return res.send("Username or email is already used");
        }
        else if (pw !== confipw) //if password is different to the confirm password this will activate a error
        {
            return res.send("Passwords are not the same");
        } 
        else //if the other conditions are false, this is one is setted
        {
            res.send("");
            await User.create({
            name,
            username,
            email, 
            pw:encryptedPassword,
            confipw:encryptedconfirmPassword,
        });
        }
       
    }catch(error){
        res.send("Error");
    }
});


//Login a user
app.post("/loginuser",async(req,res)=>{
    const {email,pw} = req.body; //body request for the parameters of login
    const user = await User.findOne({email});//see if the email exists
    if(!user)
    {
        return res.send("User not found");
    }

    if(await bcrypt.compare(pw,user.pw)){
        const token = jwt.sign({email:user.email },JWT_SECRET);//This is used for authentication, when a 
        //user signs to an application then assigns JWT to that user.
        const userna = user.username;
        console.log(userna);
        if(res.status(201)) //if success
        {
            return res.send(userna);
        }
        else
        {
            return res.send("error");
        }
    }
    else
    {
        res.send("Invalid Password");
    }   
});

const sendResetPasswordMail = async(email,link)=>{
    try{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user: 'noreplyloginapp18881@gmail.com',//email responsible to send the email
                pass: 'kppunrkqttoonjjh'//password of that email
            }
        });
        const mailOptions = {
            from:'noreplyloginapp18881@gmail.com',
            to: email,//email that is defined to the user input 
            subject:'For Reset Password',
            //html: `You just received a mail!`
            html:'<p> Hi,Please enter the link and reset your password: <br/> <a href="'+link+'">'+link+'</a>'
        }
        transporter.sendMail(mailOptions,function(error,infor){
            if(error){
                console.log(error);
            }
            else{
                console.log("Mail has been sent- ",infor.response);
            }
        });
    }catch(error){
        res.status(400).send({success:false,msg:error.message});
    }   
}

//Forgot Password
app.post("/forgot-password",async(req,res,next)=>{
    const {email} = req.body; //body request for the parameters of forgotpassword
    try {
        const userData = await User.findOne({email});//see if the email is in the mongodatabase
        if(!userData)
        {
            return res.send("User not found");
        }
        else{
            const secret = JWT_SECRET + userData.pw;
            const token = jwt.sign({email:userData.email,id:userData._id},secret,{expiresIn:'5m'});//This is used for authentication, when a 
            //user wants to recover his password, the id and email of that user are the data and the secret expires in 5 minutes .
            const link = `http://localhost:5000/reset-password/${userData._id}/${token}`;
            sendResetPasswordMail(userData.email,link);
            console.log(link);    
            res.send("Now you can verify your email");   
        }
    }catch(error){

    }       
});

//HTTP POST requests supply additional data from the client(browser) to the server in the message body
//HTTP GET requests include all required data in the URL

//Forgot Password, token and id
app.get("/reset-password/:id/:token",async(req,res)=>{
    const {id,token} = req.params;//request for the parameters of token and id before created
    console.log(req.params);
    const userData = await User.findOne({_id:id});//see if the id was created
    if(!userData)
    {
        res.render("index",{status:"User not found"});
    }
    const secret = JWT_SECRET + userData.pw;
    try {
        const verify = jwt.verify(token,secret);// verify a token symmetric
        res.render("index",{email:verify.email,status:"Not Verified"});
    }catch(error){
        res.render("index",{email:verify.email,status:"Something went wrong"});
    }
});

//Forgot Password token and id
app.post("/reset-password/:id/:token",async(req,res)=>{
    const {id,token} = req.params;
    const {confipw,pw}= req.body;
    const userData = await User.findOne({_id:id});
    if(!userData)
    {
        res.render("index",{status:"User not found"});
    }
    else if (pw !== confipw)
    {
        res.render("index",{status:"passwords"});
    } 
    else{
        const secret = JWT_SECRET + userData.pw;
        try {
            const verify = jwt.verify(token,secret);// verify a token symmetric
            const encryptedPassword = await bcrypt.hash(pw,10);//encrypt the password
            const encryptedconfirmPassword = await bcrypt.hash(confipw,10);
            await User.updateOne( //Update user by id, setting the new passoword
                {
                  _id: id,
                },
                {
                  $set: {
                    pw: encryptedPassword,
                    confipw: encryptedconfirmPassword,
                  },
                }
              );
            res.render("index",{email:verify.email,status:"verified"});
        }catch(error){
            res.render("index",{status:"Something went wrong"});
        }
    }
    
});

require("./filmDetails");
const film = mongoose.model("Filminfo");


//Forgot Password
app.post("/filmsearch",async(req,res)=>{
    const {title} = req.body; 
    try {
        const userData = await film.findOne({title});//see if the email is in the mongodatabase
        if(!userData)
        {
            res.json({title:"Film doesn't exist"});
        }
        else{
            res.json({id:userData._id,overview: userData.overview,title:userData.title,popularity:userData.popularity,
                production_companies: userData.production_companies, release_date:userData.release_date,
                vote_average: userData.vote_average,vote_count:userData.vote_count,status:userData.status,
                belongs_to_collection: userData.belongs_to_collection,poster_path:userData.poster_path,video:userData.video,tagline:userData.tagline,
                homepage:userData.homepage,genres:userData.genres,
            });
        } 
    }catch(error){
        console.log(error);
    }       
});


app.listen(5000,()=>{
    console.log("Server started");
});