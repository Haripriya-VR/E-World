const User = require('../models/users')
const products = require('../models/products')
const Order = require('../models/order')
const Address = require('../models/Address')
const Cart = require('../models/cart');

const user_profile = async (req, res) => {
    try {
        if (req.session.email) {

            const user = await User.findOne({ email: req.session.email }).populate('address')

            const Address = user.address
            res.render('users/profile', { user, Address })
        }
    } catch (error) {
        res.render('error/500')
    }

}


const profile_addAddress_get = async (req, res) => {
    try {
        const login = req.session.login
        const userId = await User.findOne({ email: req.session.email }).select('_id');
        const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
        const cartQuantity = cart ? cart.items.length : 0;

        res.render('users/profile-addAddress', { login, cartQuantity })
    } catch (error) {
        res.render('error/500')
    }
}


const profile_addAddress_post = async (req, res) => {
    try {
        const login = req.session.login
        const userId = await User.findOne({ email: req.session.email }).select('_id');
        const address = new Address({
            fullName: req.body.username,
            mobile: req.body.phone_number,
            street: req.body.street_name,
            village: req.body.village,
            city: req.body.city,
            pinCode: req.body.pincode,
            landmark: req.body.landmark,
            district: req.body.district,
            state: req.body.state,
            userId: userId
        })
        const savedAddress = await address.save();

        await User.updateOne(
            { _id: userId },
            {
                $push: { address: savedAddress._id },
            }
        );
        res.redirect('/profile')

    } catch (error) {
        console.log('error in checkout address post', error);
        res.render('error/500')
    }

}



const profile_editAddress_get = async (req, res) => {
    try {
        const id = req.params.id
        const address = await Address.findOne({ _id: id });
        res.render('users/profile-editAddress', { address })
    } catch (error) {
        console.log('error in editing profile address', error);
        res.render('error/500')
    }

}


const profile_editAddress_post = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = await User.findOne({ email: req.session.email }).select('_id');

        const updatedAddress = await Address.updateOne(
            { _id: id, userId: userId },
            {
                $set: {
                    fullName: req.body.username,
                    mobile: req.body.phone_number,
                    street: req.body.street_name,
                    village: req.body.village,
                    city: req.body.city,
                    pinCode: req.body.pincode,
                    landmark: req.body.landmark,
                    district: req.body.district,
                    state: req.body.state,
                }
            }
        );

        res.redirect('/profile');
    } catch (error) {
        console.error('Error in profile_editAddress_post:', error);
    }
};


const delete_address = async (req, res) => {
    try {
        const id = req.params.id
        const address = await Address.deleteOne({ _id: id })
        res.redirect('/profile')
    } catch (error) {
        res.render('error/500')
    }
}


// profile orders

const profile_orders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        const userId = await User.findOne({ email: req.session.email }).select('_id');
        const orders = await Order.find({ userId: userId }).skip((page - 1) * limit).limit(limit);
        const email = req.session.email
        res.render('users/profile-orders', { orders, email, page, totalPages, limit });
    } catch (error) {
        console.log('profile orders error', error);
        res.render('error/500')
    }
}


const ordered_products = async (req, res) => {
    try {
        const login = req.session.login
        const id = req.params.id;
        const orders = await Order.findById(id).populate('products.productId')
        const products = orders ? orders.products : [];

        res.render('users/profile-orderedproducts', { products, login, orders });
    } catch (error) {
        console.log('error in ordered products', error);
        res.render('error/500')
    }
}



// cancell the products individually

// const cancel_orderedproducts = async (req, res) => {
//     try {
//         const orderId = req.params.orderId;
//         const productId = req.params.productId;

//         // Find the order and update it to remove the specified product
//         const updatedOrder = await Order.updateOne(
//             { _id: orderId },
//             { $pull: { products: { _id: productId } } }
//         );

//         if (!updatedOrder) {
//             return res.status(404).json({ success: false, message: 'Order not found.' });
//         }

//         res.redirect('/users/profile-orderedproducts');
//         // res.status(200).json({ success: true, updatedOrder });
//     } catch (error) {
//         console.error('Error in cancel_orderedproducts:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };



// const cancel_order = async (req, res) => {
//    try {
//     const orderId = req.params.id;
//     const canceledOrder = await Order.deleteOne({ _id: orderId })
//     console.log('cancelled order', canceledOrder);
//     res.redirect('/profile/profile-orders')

//    } catch (error) {

//     res.render('error/500')
//    }
// }

const cancel_order = async (req, res) => {
    try {
        const status = req.body.status;
        const orderId = req.body.orderId;

        const cancelledOrder = await Order.updateOne({ _id: orderId }, { $set: { orderStatus: status } });

        console.log('cancelled order', cancelledOrder);

        const newStatus = await Order.findOne({ _id : orderId })
        res.status( 200 ).json({ success : true, status : newStatus.orderStatus })

        // res.redirect('/profile/profile-orders');
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.render('error/500');
    }
};



module.exports = {
    user_profile,
    profile_addAddress_get,
    profile_addAddress_post,
    profile_editAddress_get,
    profile_editAddress_post,
    profile_orders,
    ordered_products,
    // cancel_orderedproducts,
    cancel_order,
    delete_address,
}