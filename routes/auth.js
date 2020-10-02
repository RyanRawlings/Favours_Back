const router = require('express').Router();
const User = require('../models/User');

router.post('/register', async (req,res)=> {
    const user = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        middlename: req.body.middlename,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,        
    });
    try {
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (err) {
        res.status(400).send(err);
    }
})



module.exports = router;