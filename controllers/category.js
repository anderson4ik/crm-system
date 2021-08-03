const path = require('path');
const fs = require('fs');

const Category = require('../models/Category');
const Position = require('../models/Position');
const errorHandler = require('../utils/errorHandler');

module.exports.getAll = async function(req, res) {
    try{
        const categories = await Category.find({
            user: req.user.id //we get "user" from middleware passport.js that add it to object request
        });
        res.status(200).json(categories);
    } catch (e) {
        errorHandler(res, e);
    }
}

module.exports.getById = async function(req, res) {
    try{
        const category = await Category.findById(req.params.id);
        //we get "user" from middleware passport.js that add it to object request
        res.status(200).json(category);
    } catch (e) {
        errorHandler(res, e);
    }
}

module.exports.remove = async function(req, res) {
    try{
        // removing the image file after
        const category = await Category.findById(req.params.id);
        const imageSrc = category.imageSrc;
        fs.unlink(path.join(imageSrc), (err) => {
            if (err) {
                errorHandler(res, err);
            }
        });

        await Category.remove({
            _id: req.params.id
        });
        await Position.remove({
            category: req.params.id
        });
        res.status(200).json({
            message: 'The Category was removed successfully!'
        });
    } catch (e) {
        errorHandler(res, e);
    }
}

module.exports.create = async function(req, res) {
    const category = new Category({
        name: req.body.name,
        imageSrc: req.file ? req.file.path : '', // data about path to image, provided by middleware multer
        user: req.user.id //we get "user" from middleware passport.js that add it to object request
    })

    try{
        await category.save();
        res.status(201).json(category);
    } catch (e) {
        errorHandler(res, e);
    }
}

module.exports.update = async function(req, res) {
    const updated = {
        name: req.body.name,
    }
    if(req.file) {
        updated.imageSrc = req.file.path;
    }

    try{
        const category = await  Category.findOneAndUpdate(
            {_id: req.params.id},
            {$set: updated}, //update the object category
            {new: true} //first update object in mongoose & only after return it
        );
        res.status(200).json(category);
    } catch (e) {
        errorHandler(res, e);
    }
}
