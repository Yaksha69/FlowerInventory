const Sales = require('../models/sales');
const Data = require('../models/Data');

// Add a sale and update inventory
const addSale = async (req, res) => {
    const { Product, QuantitySold, Price } = req.body;

    try {
        // Find the product in inventory
        const product = await Data.findOne({ Product });

        if (!product) {
            return res.status(404).json({ error: 'Product not found in inventory' });
        }

        if (product.Quantity < QuantitySold) {
            return res.status(400).json({ error: 'Not enough stock available' });
        }

        // Deduct the quantity from the inventory
        product.Quantity -= QuantitySold;
        await product.save();

        // Calculate the total sale price
        const total = QuantitySold * Price;

        // Create a new sale record
        const newSale = new Sales({
            Product,
            QuantitySold,
            Price,
            Total: total
        });

        await newSale.save();

        res.status(200).json({
            message: 'Sale recorded successfully',
            sale: newSale,
            updatedInventory: product
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllSales = async (req, res) => {
    try {
        const sales = await Sales.find({});
        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// this is for the dashboard


const filterHighestSelling = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const highestSellingProducts = await Data.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        })
            .sort({ QuantitySold: -1 }) // Sort by units sold in descending order
            .limit(3); // Limit to top 3 products

        res.status(200).json(highestSellingProducts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch highest selling products', details: err.message });
    }
};

const filterTotalSales = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const totalSales = await Data.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            {
                $group: {
                    _id: null, // Group all data together
                    totalSales: {
                        $sum: {
                            $multiply: ['$QuantitySold', '$Price'], // Calculate sales per product
                        },
                    },
                },
            },
        ]);

        const result = totalSales.length > 0 ? totalSales[0].totalSales : 0;

        res.status(200).json({ totalSales: result });
    } catch (err) {
        res.status(500).json({ error: 'Failed to calculate total sales', details: err.message });
    }
};

module.exports = { 
    addSale, 
    getAllSales,
    filterHighestSelling,
    filterTotalSales, };
