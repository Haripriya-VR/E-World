const coupon = require( '../models/coupon' )

module.exports = {

    discountPrice : async ( couponId, cartTotal ) => {
     
        const Coupon = await coupon.findById(couponId);
        if (!Coupon) {
            return {
            discountAmount: 0, 
            discountedTotal: cartTotal
            };
        }
        let discountAmount = 0;
        if (Coupon.discountType === "percentage") {
            discountAmount = (Coupon.discount / 100) * cartTotal;
           
        } else if (Coupon.discountType === "fixed") { 
            discountAmount = Coupon.discount;
      
        }
        // Calculate the discounted total
        const discountedTotal = cartTotal - discountAmount;
      
        return { discountAmount, discountedTotal }
    }      
}