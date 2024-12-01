const { response } = require('express')
const Data = require('../models/Data')
const mongoose = require('mongoose')


const addData = async (req, res) => {
    const { Product, Quantity, Price } = req.body;
    const image = req.file ? req.file.filename : ''; // Get the filename of the uploaded image

    try {
        // Check if the product already exists in the database
        const existingProduct = await Data.findOne({ Product });

        if (existingProduct) {
            // If the product exists, increment the quantity and update the price
            existingProduct.Quantity + Quantity;
            existingProduct.Price = Price;
            await existingProduct.save();
            return res.status(200).json({ message: 'Product updated', product: existingProduct });
        } else {
            // If the product doesn't exist, create a new product
            const newProduct = await Data.create({ Product, Quantity, Price, image });
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
const editData = async (req, res) => {
    const { Product } = req.params; // Get the Product name from URL parameters
    const { Quantity, Price } = req.body; // Get updated fields from the request body

    try {
        // Find and update the product by its name
        const updatedData = await Data.findOneAndUpdate(
            { Product }, // Match the product by name
            { $set: { Product, Quantity, Price } }, // Update these fields
            { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!updatedData) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
};

const addQuantity = async (req, res) => {
    const { Product } = req.params; // Get the Product name from URL parameters
    const { incrementBy } = req.body; // Get the increment value from the request body

    try {
        // Validate incrementBy is a positive number
        if (!incrementBy || incrementBy <= 0) {
            return res.status(400).json({ error: 'Increment value must be greater than zero' });
        }

        // Find the product and increment its quantity
        const updatedData = await Data.findOneAndUpdate(
            { Product }, // Match the product by name
            { $inc: { Quantity: incrementBy } }, // Increment the Quantity field
            { new: true, runValidators: true } // Return the updated document and validate
        );

        if (!updatedData) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Quantity added successfully', product: updatedData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update quantity', details: err.message });
    }
};




module.exports = {
    addData,
    getAllData,
    editData,
    deleteData,
    filterLowStock,
    addQuantity
}
