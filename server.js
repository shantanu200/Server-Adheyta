import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
var app = express();

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.get("/getname", (req, res) => {
  res.send("Hello world");
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
