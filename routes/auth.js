const router = require('express').Router();
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req,res) => {
    //Validate the data before passing the request to the DB
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    //Check if email already exists
    const emailExists = await User.findOne({email: req.body.email});
    if (emailExists) return res.status(400).send('Email exists already!');

    //Create new user
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
});

module.exports = router;