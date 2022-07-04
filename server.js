import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import {fileURLToPath} from "url";
import { createCipheriv } from "crypto";

dotenv.config();
var app = express();

const __filename = fileURLToPath(import.meta.url);


const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use("/images",express.static(path.join(__dirname,"/images")));



const dbserver = process.env.DBSERVER;

mongoose
  .connect(dbserver, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
  });

const studentSchema = mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    email: String,
    username: String,
    password: String,
    branch: String,
    year: String,
    division: String,
    prn: Number,
    roll: Number,
  },
  { timestamps: true }
);


const Student = new mongoose.model("Student", studentSchema);

app.post("/login", (req, res) => {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  const { username, password } = req.body;

  Student.findOne({ username: username }, (err, stud) => {
    if (stud) {
      if (password === stud.password) {
        res.send({
          title: "Success",
          text: "User Found Successfully!",
          icon: "success",
          confirmButtonText: "Next",
          user: stud
        });
      } else {
        res.send({
          title: "ERROR",
          text: "Password Not Matched for User",
          icon: "error",
          confirmButtonText: "ReSubmit",
        });
      }
    } else {
      res.send({
        title: "ERROR",
        text: "No such User is found in database",
        icon: "error",
        confirmButtonText: "Register",
      });
    }
  });
});

app.post("/register", (req, res) => {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  const {
    firstname,
    lastname,
    email,
    username,
    password,
    branch,
    year,
    division,
    prn,
    roll,
  } = req.body;
  const student = new Student({
    firstname,
    lastname,
    email,
    username,
    password,
    branch,
    year,
    division,
    prn,
    roll,
  });


  Student.findOne({ email: email }, (err, estud) => {
    if (estud) {
      res.send({
        title: "ERROR",
        text: "User available with these email",
        icon: "error",
        confirmButtonText: "Change Email",
      });
    } else {
      Student.findOne({username: username },(err, ustud) => {
        if (ustud) {
          res.send({
            title: "ERROR",
            text: "User available with these username",
            icon: "error",
            confirmButtonText: "Change Username",
          });
        } else {
          student
            .save()
            .then((stud) => {
              res.send({
                title: "SUCCESS",
                text: "New User is Registered Successfully",
                icon: "success",
                confirmButtonText: "Ok",
              });
            })
            .catch((err) => {
              res.send({
                message: "ERROR",
              });
            });
        }
      });
    }
  });
});





app.get("/record",(req,res) => {
    Student.find(function(err,student){
      if(err){
        console.log(err);
      }else{
        res.json(student);
      }
    })
});

const notesSchema = mongoose.Schema({
   username:String,
   subject:String,
   topic:String,
   title:String,
   des:String,
},{timestamps:true})

const Notes = new mongoose.model("Notes",notesSchema);

app.post("/notes/insert",function(req,res){
  if(!req.body) res.sendStatus(400);

  console.log(req.body);

  const {username,subject,topic,title,des} = req.body;

  const notes = new Notes({
    username,
    subject,
    topic,
    title,
    des
  });

  if(username!="" && subject!="" && topic!="" && title!="" && des!=""){
    notes.save().then((notes) => {
      res.send("Notes added Successfully");
    }).catch((err) => {res.send("Error occured at server")});
  }
})

app.get("/notes/noterecord",function(req,res){
  Notes.find(function(err,notedb){
    if(err){
      res.json(err);
    }else{
      res.json(notedb);
    }
  })
})

app.get("/notes/:id",function(req,res){
  let id = req.params.id;
  Notes.findById(id,function(err,notes){
      res.json(notes);
  })
})

app.post("/notes/update/:id",function(req,res)  {
   Notes.findById(req.params.id,function(err,notes){
    if(!notes) res.status(404).send("Notes is not found");

    else{
      notes.subject = req.body.subject;
      notes.topic = req.body.topic;
      notes.title = req.body.title;
      notes.des = req.body.des;

      notes.save().then((notes) => {
          res.json("User is Updated");
      })
      .catch((err) => {
        res.status(400).send("Update not Possible");
      })
    }
   })
})

app.get("/notes/delete/:id",function(req,res){
  Notes.findByIdAndRemove({
    _id:req.params.id
  },function(err,notes){
    if(err) res.json(err);
    else res.json("User deleted Sucessfully");
  })
})

app.get("/notes/record/:username",function(req,res){
  let username = req.params.username;
  Notes.find({username:username},function(err,notes){
    if(notes) res.json(notes);
    else res.send("Error Occured");
  })
})

const PostSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
    },
    categories: {
      type: Array,
      required: false,
    },
},{timestamps:true});

const Post = new mongoose.model("Post",PostSchema);

const storage = multer.diskStorage({
   destination: (req,file,cb) => {
    cb(null,"images");
   },
   filename: (req,file,cb)=>{
    cb(null,req.body.name);
   }
})

const upload = multer({storage:storage});

app.post("/student/upload",upload.single("file"),(req,res)=>{
  res.status(200).json("File has been uploaded");
})

app.post("/student/postblog",function(req,res){
  if(!req.body) res.staus(400).send("Error occured");

  const newPost = new Post(req.body);
  try{
    newPost.save()
    .then((newPost) => {
      res.json(newPost);
    })
  }catch (err){
    res.status(500).json(err);
  }
})

app.get("/postrecords",function(req,res){
   Post.find(function(err,posts){
    if(err){
      res.json(err);
    }else{
      res.json(posts);
    }
   })
})

app.get("/posts/getdata/:id",function(req,res){
  let id = req.params.id;

  Post.findById(id,function(err,post){
    res.json(post);
  });
})

app.post("/posts/update/:id",(req,res) => {
  let id = req.params.id;

  Post.findById(id,(err,user)=>{
    if(!user) res.status(404).send("Data is not found");

    else{
      user.username = req.body.username;
      user.title = req.body.title;
      user.des = req.body.des;

      user.save().then((user)=>{
        res.json("User is updated");
      })
      .catch((err)=>{
        res.status(400).send("Update is not possible");
      })
    }
  })
})

app.get("/posts/delete/:id",function(req,res){
  Post.findByIdAndRemove({
    _id : req.params.id
  },function(err,user){
    if(err) res.json(err);

    else res.json("User is deleted Successfully");
  })
})

const CategorySchema = new mongoose.Schema({
  name:{
    type: String,
    required:true
  }
},{timestamps:true})

const Category = mongoose.model("Category",CategorySchema);

app.post("/saveCategories",(req,res)=>{
  const newCat = new Category(req.body);
  try{
    const savedCat = newCat.save();
    res.status(200).json(savedCat);
  }catch(err){
    res.status(400).json(err);
  }
})

app.get("/categories",(req,res)=>{
  try{
     const cats = Category.find();
     res.status(200).json(cats);
  }catch(err){
     res.status(500).json(err);
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
