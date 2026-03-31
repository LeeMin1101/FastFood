const express = require('express');
const router = express.Router();
const Table = require('../models/tables');

router.get('/', async (req, res) => {
  try {
    let tables = await Table.find().sort({ tableNumber: 1 });
    if (tables.length === 0) {
      const initialTables = Array.from({length: 20}, (_, i) => ({ tableNumber: i + 1, isBooked: false }));
      await Table.insertMany(initialTables);
      tables = await Table.find().sort({ tableNumber: 1 });
    }
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy dữ liệu bàn' });
  }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    table.isBooked = !table.isBooked;
    await table.save();
    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật bàn' });
  }
});

module.exports = router;