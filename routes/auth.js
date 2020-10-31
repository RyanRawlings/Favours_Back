const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {registerValidation, loginValidation} = require("../validation");

/**
 * Api for sign up or registration
 * @desc takes user information and save them into database and create new user
 * @param string firstname, string middlename(optional), string lastname, string email, string password
 * @return int user - user id
 */
router.post("/register", async (req, res) => {
    //Validate the data before passing the request to the DB
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Check if email already exists
    const emailExists = await User.findOne({email: req.body.email});
    if (emailExists) return res.status(400).send("Email exists already!");

    //Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create new user
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        groups: [],
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        res.send({user: user._id});
    } catch (err) {
        res.status(400).send(err);
    }
});

/**
 * Api for login
 * @desc takes user's email and password, match them in database, if information are correct then create a token and save it in cookie
 * @param string email, string password
 * @return string token - assigned in cookie, object user - user id, first name, last name, email
 */
router.post('/login', async (req, res) => {
    //Validate the data before passing the request to the DB
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Check if email exists
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Email is not found');
    //Password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    //Create and assign a token
    const token = jwt.sign({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
    }, process.env.TOKEN_SECRET);
    res.cookie('auth-token', token, {httpOnly: true});
    res.json({
        token: token
        , user: {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
        }
    });

});

/**
 * Api for logout
 * @desc clears login token from cookie
 */
router.post('/logout', async (req, res) => {
    res.clearCookie();
})

// export '/register', '/login' and '/logout' router
module.exports = router;
