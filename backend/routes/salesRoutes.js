const express = require('express');
const router = express.Router();
const { addSale, getAllSales, filterHighestSelling, filterTotalSales } = require('../controllers/salesController');

const cookieParser = require('cookie-parser');
const app = express();

// Use cookie-parser middleware before route handlers
app.use(cookieParser());

// Endpoint to add a sale
router.post('/addsale', addSale);

// Endpoint to get all sales
router.get('/allsales', getAllSales);

router.get('/highest-selling', filterHighestSelling);
router.get('/total-sales', filterTotalSales);


module.exports = router;
