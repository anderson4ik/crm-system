const moment = require('moment'); // library to work with dates

const Order = require('../models/Order');
const errorHandler = require('../utils/errorHandler');


module.exports.overview = async function(req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1});
        // sort from old orders to new
        //we get "user" from middleware passport.js that add it to object request
        const ordersMap = getOrdersMap(allOrders);
        const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || [];

        // Number of order yesterday
        const totalOrdersYesterday = yesterdayOrders.length;
        // Total orders
        const totalOrdersNumber = allOrders.length;
        // Total days with orders
        const totalDays = Object.keys(ordersMap).length // get number of keys from object
        // Average number of Orders per day
        const avgOrdersPerDay = (totalOrdersNumber / totalDays).toFixed(0);
        // Percent for number of orders
        // ((orders_yesterday / avg_num_orders_per_day) -1) * 100
        const ordersPercent = (((totalOrdersYesterday / avgOrdersPerDay) -1) *100).toFixed(2);
        // total revenues
        const totalRevenues = calculateTotalRevenues(allOrders);
        // avg revenue per day
        const avgRevenuePerDay = (totalRevenues / totalDays).toFixed(2);
        // revenue for yesterday
        const yesterdayRevenues = calculateTotalRevenues(yesterdayOrders);
        // Percent of revenue
        const revenuePercent = (((yesterdayRevenues / avgRevenuePerDay) -1) *100).toFixed(2);
        // comparison of revenue
        const compareRevenue = (yesterdayRevenues - avgRevenuePerDay).toFixed(2);
        // comparison of orders number
        const compareOrderNum = (totalOrdersYesterday - avgOrdersPerDay).toFixed(2);

        res.status(200).json({
            gain: {
                percent: Math.abs(+revenuePercent),
                compare: Math.abs(+compareRevenue),
                yesterday: +yesterdayRevenues,
                isHigher: +revenuePercent > 0,
            },
            orders: {
                percent: Math.abs(+ordersPercent),
                compare: Math.abs(+compareOrderNum),
                yesterday: +totalOrdersYesterday,
                isHigher: +ordersPercent > 0,
            }
        });
    } catch (e) {
        errorHandler(res, e);
    }
}

module.exports.analytics = async function(req, res) {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1});
        // sort from old orders to new
        //we get "user" from middleware passport.js that add it to object request
        const ordersMap = getOrdersMap(allOrders);

        // avg purchase = total revenues / days number
        const avgCheck = +(calculateTotalRevenues(allOrders) / Object.keys(ordersMap).length).toFixed(2);

        const chart = Object.keys(ordersMap).map(label => { //return array of objects [{label, order, gain}, ...]
            // label === 05.08.21
            const gain = calculateTotalRevenues(ordersMap[label]); // revenue per day
            const order = ordersMap[label].length; // numbers of order per day

            return {label, order, gain};
        })

        res.status(200).json({avgCheck, chart});
    } catch (e) {
        errorHandler(res, e);
    }
}

function getOrdersMap(orders = []) {
    const daysOrders = {};
    orders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYYY');

        // check and exclude today orders
        if(date === moment().format('DD.MM.YYYY')) {
            return false;
        }
        if(!daysOrders[date]) {
            daysOrders[date] = [];
        }
        daysOrders[date].push(order);
    })
    return daysOrders;
}

function calculateTotalRevenues(orders) {
    return orders.reduce((accum, order) => {
        const orderTotalPrice = order.list.reduce((orderTotal, item) => {
            return orderTotal += item.cost * item.quantity;
        }, 0);
        return accum += orderTotalPrice;
    }, 0);
}
