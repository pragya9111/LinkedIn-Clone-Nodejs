var express = require('express');
var router = express.Router();
var userModel = require('./users')
var postModel = require('./posts')
var jobModel = require('./job')
var passport = require('passport');
const localStrategy = require('passport-local');
const multer = require('multer');
passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.fieldname)
  }
})

const upload = multer({ storage: storage })

router.get('/', function (req, res, next) {
  res.render('index');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/userProfile',
  failureRedirect: '/'
}), function (req, res, next) { });

router.get('/register/company', function (req, res) {
  res.render('companyregister')
});

router.get('/register/user', function (req, res) {
  res.render('userregister')
});

router.post('/register/company', function (req, res) {
  var data = new userModel({
    username: req.body.name,
    name: req.body.name,
    contact: req.body.contact,
    email: req.body.email,
    isAdmin: true
  })
  userModel.register(data, req.body.password)
    .then(function (createdCompany) {
      res.send(createdCompany)
      // res.render('companyProfile',{createdCompany})
    })
});

router.post('/register/user', function (req, res) {
  var data = new userModel({
    username: req.body.name,
    name: req.body.name,
    contact: req.body.contact,
    email: req.body.email,
    isAdmin: false
  })
  userModel.register(data, req.body.password)
    .then(function (createdUser) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/userProfile')
        // res.render('userProfile', { createdUser })
      })
    })
});

router.get('/userProfile', isLoggedIn, function (req, res) {
  postModel.find()
    .populate("username")
    .then(function (foundPost) {
      userModel.findOne({ username: req.session.passport.user })
        .then(function (foundUser) {
          // res.send(foundPost)
          res.render('userProfile', { foundUser, foundPost })
          // res.render('userProfile',{foundPost})      
        })
    })
});

router.post('/createPost', upload.single('image'), function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      if (req.file !== undefined) {
        postModel.create({
          image: req.file.filename,
          caption: req.body.caption,
          username: foundUser._id
        })
          .then(function (createdPost) {
            foundUser.posts.push(createdPost)
            foundUser.save()
              .then(function () {
                res.redirect('/userProfile')
                // res.send(createdPost)
              })
          })
      }
      else {
        postModel.create({
          caption: req.body.caption,
          username: foundUser._id
        })
          .then(function (createdPost) {
            foundUser.post.push(createdPost)
            foundUser.save()
              .then(function () {
                res.send(createdPost)
              })
          })
      }

    })
});

router.get('/deletePost/:id', isLoggedIn, function (req, res) {
  postModel.findOneAndDelete({ _id: req.params.id })
    .then(function (deletedpost) {
      res.send(deletedpost)
    })
});

router.get('/connectionRequest/:id', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user }) //loggedin user finding
    .then(function (foundUser) {
      userModel.findOne({ _id: req.params.id }) //jisne request send kri he uski id find kiya
        .then(function (requestedUser) {
          foundUser.connectionsRequest.push(requestedUser._id) //loggedin user me requested senduser ki id push kra di
          foundUser.save()
            .then(function () {
              requestedUser.connectionsRequestSend.push(foundUser._id) //jisne request send kri uske send request array me loggedin user ki id daal di
              requestedUser.save()
                .then(function () {
                  res.send("ok request send")
                })
            })
        })
    })
});

router.get('/connectionAccept/:id', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.passort.session.user }) //loggedin user find kiya
    .then(function (foundUser) {
      userModel.findOne({ _id: req.params.id }) //jiski request accept ki he uski id find ki
        .then(function (acceptedUser) {
          foundUser.connectionsAccepted.push(foundUser._id) //loggedinuser ke conectionAccepted aaray me push kr diya jisne request send ki uski id
          foundUser.save()
            .then(function () {
              var index = foundUser.connectionsRequest.indexOf(acceptedUser._id) //loggeddin user ke connectionRequest array ke konse index pe request he use find kr rhe he 
              foundUser.connectionsRequest.splice(index, 1) //request ko connectionrequest array se  delete klr rhe
              foundUser.save()
                .then(function () {
                  acceptedUser.connectionsAccepted.push(foundUser._id) //jisne request accept kari uski id connectionAccepted (jisne request send ki thi) me push kr di 
                  acceptedUser.save()
                    .then(function () {
                      var indx = acceptedUser.connectionsRequestSend.indexOf(foundUser._id) //jisne request send ki uske  connectionsRequestSend array se request accept (loggedin user ko hata diya  )
                      acceptedUser.connectionsRequestSend.splice(indx, 1)
                      acceptedUser.save()
                        .then(function () {
                          res.send("request accepted")
                        })
                    })
                })
            })
        })
    })
});

router.get('/connectionReject/:id', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      userModel.findOne({ _id: req.params.id })
        .then(function (user) {
          const index = foundUser.connectionsRequest.indexOf(user._id)
          foundUser.connectionsRequest.splice(index, 1)
          foundUser.save()
            .then(function () {
              const ind = user.connectionsRequestSend.indexOf(foundUser._id)
              user.connectionsRequestSend.splice(ind, 1)
              user.save()
                .then(function () {
                  res.redirect(req.headers.referer)
                })
            })
        })
    })
});

router.get('/createJob', isLoggedIn, function (req, res) {
  res.render('/')
});

router.post('/createJob', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.password.user })
    .then(function (foundUser) {
      jobModel.create({
        postedBy: foundUser._id,
        jobTitle: req.body.jobTitle,
        location: req.body.location,
        experience: req.body.experience,
        jobDetail: req.body.jobDetail
      })
        .then(function (createdJob) {
          foundUser.createdJob.push(createdJob)
          foundUser.save()
            .then(function () {

            })
        })
    })
});

router.get('/deleteJob/:id', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      jobModel.findOneAndDelete({ _id: req.params.id })
        .then(function (deleteJob) {
          res.redirect(req.headers.referer)
        })
    })
});

router.get('/reset', function (req, res) {
  res.render('reset')
});

router.post('/reset', function (req, res) {
  userModel.findOne({ email: req.body.email })
    .then(function (userFound) {
      if (userFound !== null) {
        var secrt = uuid()
        userFound.secret = secrt
        userFound.expiry = Date.now() + 24 * 60 * 60 * 1000
        userFound.save()
          .then(function () {
            sendMail(req.body.email, `http://localhost:3000/reset/${userFound._id}/${secrt}`)
              .then(function () {
                res.send('Link emailed to you, please check your mail ! !')
              })
          })
      }
    })
});

router.get('/reset/:userid/:secret', function (req, res) {
  userModel.findOne({ _id: req.params.userid })
    .then(function (user) {
      if (user.secret === req.params.secret) {
        res.render('resetpswrd', { user })
      }
    })
});

router.post('/resetpswrd/:userid', function (req, res) {
  userModel.findOne({ _id: req.params.userid })
    .then(function (usermila) {
      if (req.body.password === req.body.confirmpswrd) {
        usermila.setPassword(req.body.password, function () {
          usermila.save()
            .then(function (updatedUser) {
              req.login(updatedUser, function (err) {
                if (err) {
                  return next(err)
                }
                else {
                  res.redirect('/profile')
                }
              })
            })
        })
      }
    })
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/')
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else {
    res.redirect('/')
  }
};

module.exports = router;
