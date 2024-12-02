const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');


const {addData, getAllData, deleteData, filterLowStock, editData, addQuantity, checkProduct } = require('../controllers/dataController')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the folder for uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
const upload = multer({ storage: storage });
//POST REQUEST
router.post('/new', upload.single('productImage'), addData);

//GET REQUEST
router.get('/all', getAllData)

//router.get('/getdata', getData)

router.put('/edit/:Product', editData);

router.delete('/delete/:Product', deleteData);

router.get('/lowstock', filterLowStock);

router.put('/increment/:Product', addQuantity);

router.get('/check-product', checkProduct);


module.exports = router