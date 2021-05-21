const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt_decode =  require('jwt-decode');
require('dotenv/config');
const expressJwt = require('express-jwt');
const {Post} = require('../models/Post');
const {Comment} = require('../models/comment');
const multer = require('multer');
const authJwt1 = require('../auth.js');


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'video/mp4': 'mp4',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })





router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            isAdmin: req.body.isAdmin,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.post('/login', async (req,res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({user: user.email , token: token}) 
    } else {
       res.status(400).send('password is wrong!');
    }

    
})

router.post('/display',authJwt1, async (req,res) => {
    // const authHeader = req.headers['authorization']
    // const token = authHeader && authHeader.split('')[1]
    // if(token == null) return res.sendStatus(401)

    // jwt.verify(token, process.env.secret, (err, user) => {
    //     if(err) return res.sendStatus(403)
    //     req.user = user
    //     console.log(user);
    // })
    console.log(req.user.userId);
    const result = await User.find();
    res.send(result);
    // const authHeader = req.headers.authorization;

    // if (authHeader) {
    //     const token = authHeader.split(' ')[1];

    //     jwt.verify(token, process.env.secret, (err, user) => {
    //         if (err) {
    //             return res.sendStatus(403);
    //         }

    //         req.user = user;
    //         console.log(req.user.userId);

    //     });
    // } else {
    //     res.sendStatus(401);
    // }
})

router.post('/post', uploadOptions.single('image'), async (req,res)=>{
   
    const authHeader = req.headers.authorization;

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request')

    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

          jwt.verify(token, process.env.secret, async (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            user1 = req.user.userId;
            console.log(req.user.userId);
            let post = new Post({
                image: `${basePath}${fileName}`,
                description: req.body.description,
                userid: req.user.userId,
            })

            post = await post.save();
            
            await User.findByIdAndUpdate(
                user1
            , {
                 $push: {
                     posts: post._id,
                 }
            })

            
            
        
            if(!post)
            return res.status(400).send('the user cannot be created!')
        
            res.send(post);

        });
    } else {
        res.sendStatus(401);
    }
   
   
    
})

router.put('/post11/:id', async (req,res)=>{
   
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

          jwt.verify(token, process.env.secret, async (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            user1 = req.user.userId;
            console.log(req.user.userId);

            posts2 = await Post.findById(
                req.params.id,
            )
            
            // var num = []
            // num =  await posts2.like; 

            // var num5 = num.length;

            // var i;

            // for(i=0; i<num5; i++){
            //     if(user1 == num[i]){
            //         return res.status(400).send('already liked'); 
            //     }
            // }
             
            


            // if(user1 == num)
            // return res.status(400).send('user cant like his/her own post');
        
            const post = await Post.findByIdAndUpdate(
                req.params.id,
               { 
                   $push: {
                    like: user1,
                }
             } )
             
             var num1 = await post.nooflike;
             num1 = num1 + 1;
 
             const post1 = await Post.findByIdAndUpdate(
                req.params.id,
               { 
                   nooflike: num1
             } ).populate('like').select('-description')

             
        
            if(!post1)
            return res.status(400).send('the order cannot be update!')
        
            res.send(post1);

        });
    } else {
        res.sendStatus(401);
    }
   
   
    
})



router.post('/post1', async (req,res)=>{
   
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

          jwt.verify(token, process.env.secret, async (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            user1 = req.user.userId;
            console.log(req.user.userId);
            let post = new Post({
                description: req.body.description,
                userid: req.user.userId,
            })

            post = await post.save();
            
            posts1 = await Post.find({
                userid : user1
            })

            if(!posts1)
            return res.status(400).send('the user cannot be created!')
        
            res.send(posts1).limit(userid);

        });
    } else {
        res.sendStatus(401);
    }   
})




router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})


module.exports =router;