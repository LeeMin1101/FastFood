const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

router.post('/create', async (req, res) => {
    try {
        const newCoupon = new Coupon(req.body);
        await newCoupon.save();
        res.status(201).json({ message: 'Tạo mã giảm giá thành công!', coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo mã', error });
    }
});

router.post('/apply', async (req, res) => {
    const { code, orderValue, shippingFee = 0 } = req.body; 
    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        
        if (!coupon) return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã bị khóa!" });
        if (new Date() > coupon.expiryDate) return res.status(400).json({ message: "Mã giảm giá đã hết hạn!" });
        if (orderValue < coupon.minOrderValue) return res.status(400).json({ message: `Đơn hàng phải từ ${coupon.minOrderValue.toLocaleString()}đ để áp dụng mã này!` });

        let discountAmount = 0;
        if (coupon.discountType === 'percent') {
            discountAmount = (orderValue * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

        const maxDiscountable = orderValue + shippingFee;
        discountAmount = discountAmount > maxDiscountable ? maxDiscountable : discountAmount;

        res.status(200).json({ 
            message: "Áp dụng thành công!", 
            discountAmount, 
            code: coupon.code 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách mã', error });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Cập nhật thành công", updatedCoupon });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật", error });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Xóa mã thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa mã", error });
    }
});

module.exports = router;