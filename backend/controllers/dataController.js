const { response } = require('express')
const Data = require('../models/Data')
const mongoose = require('mongoose')


const addData = async (req, res) => {
    const { Product, Quantity, Price } = req.body;

    try {
        // Check if the product already exists in the database
        const existingProduct = await Data.findOne({ Product });

        if (existingProduct) {
            // If the product exists, increment the quantity and update the price
            existingProduct.Quantity += Quantity;  // Increment the quantity
            existingProduct.Price = Price;  // Update the price
            await existingProduct.save();
            return res.status(200).json({ message: 'Product updated', product: existingProduct });
        } else {
            // If the product doesn't exist, create a new product
            const newProduct = await Data.create({ Product, Quantity, Price });
            return res.status(200).json({ message: 'New product added', product: newProduct });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const  getAllData = async(req, res) =>{
    const data =   await Data.find({})
    res.status(200).json(data)
}

/*const  getData = async(req, res) =>{ 
    const data =   await Data.find({createdAt: })
    res.status(200).json(data)
}*/

const deleteData = async (req, res) => {
    const { Product } = req.params; // Get the Product from the URL parameters

    try {
        const deletedData = await Data.findOneAndDelete({ Product }); // Find and delete the document by Product name
        if (!deletedData) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully', deletedData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const filterLowStock = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // End of the current month

        const lowStockProducts = await Data.find({
            Quantity: { $lt: 10 }, // Threshold for low stock
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        res.status(200).json(lowStockProducts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch low stock products', details: err.message });
    }
};


module.exports = {
    addData,
    getAllData,
    deleteData,
    filterLowStock,
}
