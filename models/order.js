const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],

    totalPrice: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        required: true
    },

    walletUsed: {
        type: Number,
        required: false
    },

    amountPayable: {
        type: Number,
        required: false
    },

    orderStatus: {
        type: String,
        default: 'Pending'
    },

    address: [{
        addressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'address',
            required: true
        },
        fullName: {
            type: String,
            required: true
        },

        mobile: {
            type: Number,
            required: true
        },

        street: {
            type: String,
            required: true
        },

        village: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        pinCode: {
            type: Number,
            required: true,
        },

        landmark: {
            type: String,
            required: true
        },

        district: {
            type: String,
            required: true
        }
    }],

    date: {
        type: Date,
        default: Date.now
    },


})

module.exports = mongoose.model('order', orderSchema, 'order')