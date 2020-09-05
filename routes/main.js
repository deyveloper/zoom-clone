const express = require('express')
const { v4: uuidv4 } = require('uuid') 
const router = express.Router()


router.get('/', (req, res) => {
    res.render('home')
})

router.get('/get/room', (req, res) => {
    res.redirect(`/room/${uuidv4()}`)
})

router.get('/room/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

module.exports = router