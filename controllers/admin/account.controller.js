var express = require("express");
var bcrypt = require("bcrypt");
var moment = require("moment");
var passport = require("passport");
var userModel = require("../../models/user.model");

var router = express.Router();

router.get("/is-available", (req, res, next) => {
  var user = req.query.username;
  userModel.singleByUserName(user).then(rows => {
    if (rows.length > 0) {
      return res.json(false);
    }

    return res.json(true);
  });
});

router.get("/register", (req, res, next) => {
  res.render("pieces/register", {
    layout: "TrangChu.hbs",
    style: [
      "style1.css",
      "style2.css",
      "login.css",
      "signup.css",
      "login-register.css"
    ],
    js: ["jQuery.js", "js.js", "login-register.js"],
    logo: "logo.png"
  });
});

// router.post("/register", (req, res, next) => {
//   var saltRounds = 10;
//   var hash = bcrypt.hashSync(req.body.password, saltRounds);
//   var dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM--DD");

//   var entityAcc={
//     Username: req.body.username,
//     Password: hash,
//   };
//   var entitySub = {
//     Sub_Name: req.body.name,
//     Sub_Email: req.body.email,
//     Sub_BirthDay: dob,
//     f_Permission: 0
//   };

//   userModel.addAcc(entityAcc).then(id => {
//     res.redirect("/account/login");
//   });
// });

router.get("/login", (req, res, next) => {
  res.render('pieces/login',{layout: false});
});

router.post("/register", async (req, res, next) => {
  var name = req.body.dnusername
  var password = req.body.dnpassword
  var namedb, passworddb

  var dbUsername = await userModel.singleByUserName(name)
  if (dbUsername === undefined || dbUsername === null || Object.keys(dbUsername).length === 0 ){
    res.end("Ten dang nhap hoac mat khau khong dung (ca 2)")
    return
  }
  namedb = dbUsername[0].Username
  passworddb = dbUsername[0].Password
  console.log(name, namedb)
  if (name!== namedb) {
    res.end('Ten dang nhap hoac mat khau khong dung (ten dang nhap)')
    return
  } 
  if (password !== passworddb) {
    res.end('Ten dang nhap hoac mat khau khong dung (mat khau)')
    return
  }
  res.end('thanh cong')
});

module.exports = router;
