const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async function(req, res) {
    const candidate = await  User.findOne({
        email: req.body.email
    });

    if(candidate) {
        // check an password, user exist
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if(passwordResult) {
            // generation of token, password is valid
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 3600});

            res.status(200).json({
                token: `Bearer ${token}`
            });
        } else {
            // password isn't valid
            res.status(401).json({
                message: 'Email or password are not valid.'
            });
        }
    } else  {
        // user isn't exist
        res.status(404).json({
            message: 'Email or password are not valid.'
        });
    }
}

module.exports.register = async function(req, res) {
    const candidate = await User.findOne({email: req.body.email});

    if(candidate) {
        // user exist, server send error
        res.status(409).json({
            message: 'Such email, already in use. Try another one.'
        })
    } else {
        // create new user
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        });

        try {
            await user.save();
            res.status(201).json(user);
        } catch (e) {
            // to process an error
            errorHandler(res, e);
        }
    }
}
