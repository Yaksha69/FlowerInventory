const express = require('express')
const router = express.Router()

const {addData, getAllData, deleteData, filterLowStock} = require('../controllers/dataController')

//POST REQUEST
router.post('/new', addData)

//GET REQUEST
router.get('/all', getAllData)

//router.get('/getdata', getData)

router.delete('/delete/:Product', deleteData);

router.get('/lowstock', filterLowStock);


module.exports = router