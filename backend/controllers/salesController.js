const Sales = require('../models/Sales');
const Data = require('../models/Data');

const addSale = async (req, res) => {
    const salesData = req.body; // Expecting an array of sales data objects

    try {
        for (const sale of salesData) {
            const { productId, productName, quantity, totalPrice } = sale;

            // Find the product in the inventory and update the quantity
            const product = await Data.findById(productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${productName} not found in inventory` });
            }

            // Check if enough quantity is available
            if (product.Quantity < quantity) {
                return res.status(400).json({ error: `Not enough stock for ${productName}` });
            }

            // Deduct the quantity from inventory
            product.Quantity -= quantity;
            await product.save();

            // Create a new sale entry
            const newSale = new Sales({
                Product: productName,
                QuantitySold: quantity,
                Price: product.Price,
                Total: totalPrice
            });

            await newSale.save(); // Save the sale to the database
        }

        res.status(200).json({ message: 'Sales recorded successfully' });
    } catch (err) {
        console.error('Error processing sales:', err.message);
        res.status(500).json({ error: 'Error saving sales data', details: err.message });
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


const countWeeklySales = async (req, res) => {
    try {
        const now = new Date();

        // Calculate start and end of the current week (assuming week starts on Sunday)
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999); // Set time to 23:59:59

        console.log('Start of Week:', startOfWeek);
        console.log('End of Week:', endOfWeek);

        // Aggregate sales count for the current week
        const salesCount = await Sales.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
                },
            },
            {
                $count: "totalSales",
            },
        ]);

        const totalSales = salesCount.length > 0 ? salesCount[0].totalSales : 0;

        res.status(200).json({ weekStart: startOfWeek, weekEnd: endOfWeek, totalSales });
    } catch (err) {
        console.error('Error fetching current week sales:', err.message);
        res.status(500).json({ error: 'Failed to fetch current week sales', details: err.message });
    }
};




const filterTotalSales = async (req, res) => {
    try {
        const nows = new Date();
        const startOfMonth = new Date(nows.getFullYear(), nows.getMonth(), 1);
        const endOfMonth = new Date(nows.getFullYear(), nows.getMonth() + 1, 0, 23, 59, 59);

        console.log('Start of Month:', startOfMonth);
        console.log('End of Month:', endOfMonth);

        const totalSales = await Sales.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: {
                            $multiply: ['$QuantitySold', '$Price'],
                        },
                    },
                },
            },
        ]);
        
        console.log(totalSales);
        

        const result = totalSales.length > 0 ? totalSales[0].totalSales : 0;

        console.log('Total Sales:', result);

        res.status(200).json({ totalSales: result });
    } catch (err) {
        console.error('Error calculating total sales:', err.message);
        res.status(500).json({ error: 'Failed to calculate total sales', details: err.message });
    }
};
// Function to filter sales by a specific date
const filterSalesByDate = async (req, res) => {
    const { date } = req.query; // Get the date from the query parameter (YYYY-MM-DD)

    // Ensure the date is in the correct format
    if (!date || isNaN(new Date(date).getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Please provide a valid date (YYYY-MM-DD).' });
    }

    try {
        // Parse the selected date and create a date range (start of the day to end of the day)
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999); // Set end date to the last moment of the selected day

        // Find sales that match the selected date range
        const sales = await Sales.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        if (sales.length === 0) {
            return res.status(404).json({ message: 'No sales found for the selected date.' });
        }

        res.status(200).json(sales);
    } catch (err) {
        console.error('Error fetching sales by date:', err.message);
        res.status(500).json({ error: 'Failed to fetch sales data by date', details: err.message });
    }
};



module.exports = { 
    addSale, 
    getAllSales,
    countWeeklySales,
    filterTotalSales,
    filterSalesByDate
 };
