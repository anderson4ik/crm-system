const Order = require('../models/Order');
const errorHandler = require('../utils/errorHandler');

// localhost:5000/api/order?offset=2&limit=5
module.exports.getAll = async function(req, res) {
    const query = {
        user: req.user.id
    }

    // Date of start
    if(req.query.start) {
        query.date = {
            // filter - greater than equal
            $gte: req.query.start
        }
    }

    // Date of end
    if(req.query.end) {
        if(!query.date) {
            query.date = {};
        }
        // filter - less than equal
        query.date['lte'] = req.query.end;
    }

    // we set in frontend filter a certain number of order
    if(req.query.order) {
        query.order = +req.query.order; // cast to number type
    }

    try {
        const orders = await Order
            .find(query)
            .sort({date: -1}) //sort orders in descending order
            .skip(+req.query.offset) // "+" cast to number type
            .limit(+req.query.limit)  // "+" cast to number type

        res.status(200).json(orders);
    } catch (e) {
        errorHandler(res, e);
    }
}

module.exports.create = async function(req, res) {
    try {
        const lastOrder = await  Order
            .findOne({user: req.user.id})
            .sort({date: -1}) //sort orders in descending order
        const maxOrder = lastOrder ? lastOrder.order : 0;

        const order = await  new Order({
            list: req.body.list,
            user: req.user.id, //we get "user" from middleware passport.js that add it to object request
            order: maxOrder + 1
        }).save();
        res.status(200).json(order);
    } catch (e) {
        errorHandler(res, e);
    }
}
