const { Router } = require('express')
const Board = require('../models/board')
const List = require('../models/list')
const Card = require('../models/card')
const Activity = require('../models/activity')
const router = Router()

// fetch all the board entries
router.get('/', async (req, res, next) => {
    try {
        const boardsList = await Board.find()
        res.json(boardsList)
    } catch (error) {
        next(error)
    }
})

// create new board entry
router.post('/', async (req, res, next) => {
    try {
        const board = new Board(req.body)
        const respData = await board.save()
        res.send(respData)
    } catch (error) {
        if (error.name === 'ValidationError')
            res.status(422)
        next(error)
    }
})

// get board based on id
router.get('/:id', async (req, res, next) => {
    const _id = req.params.id
    try {
        const board = await Board.findById(_id)
        if (!board)
            return res.status(404).send()
        res.send(board)
    } catch (error) {
        next(error)
    }
})

// get lists based on boardId
router.get('/:id/lists', async (req, res, next) => {
    const _id = req.params.id
    try {
        const board = await Board.findById(_id)
        if (!board)
            return res.status(404).send()
        const lists = await List.find({ boardId: _id })
        res.send(lists)
    } catch (error) {
        next(error)
    }
})

// get cards based on boardId
router.get('/:id/cards', async (req, res, next) => {
    const _id = req.params.id
    try {
        const board = await Board.findById(_id)
        if (!board)
            return res.status(404).send()
        const cards = await Card.find({ boardId: _id })
        res.send(cards)
    } catch (error) {
        next(error)
    }
})

// get activities based on boardId
router.get('/:id/activities', async (req, res, next) => {
    const _id = req.params.id
    try {
        const board = await Board.findById(_id)
        if (!board)
            return res.status(404).send()
        const activities = await Activity.find({ boardId: _id })
        res.send(activities)
    } catch (error) {
        next(error)
    }
})


// update board content based on id
router.patch('/:id', async (req, res, next) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'image']
    const isValidOperation = updates.every(
        (update) => allowedUpdates.includes(update))
    if (!isValidOperation)
        return res.status(400).send({ error: 'Invalid updates!' })
    try {
        const board = await Board.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        if (!board)
            return res.status(404).send({ error: 'Board not found!' })
        res.send(board)
    } catch (error) {
        next(error)
    }
})


// delete board based on id
router.delete('/:id', async (req, res, next) => {
    const _id = req.params.id
    try {
        const board = await Board.findByIdAndDelete(_id)
        if (!board)
            return res.status(404).send()
        // find all lists within board and delete them as well
        const lists = await List.find({ boardId: _id })
        lists.forEach(async (list) => {
            // find all cards within each lists and delete them as well
            const cards = await Card.find({ listid: list._id })
            cards.forEach(async (card) => (
                await Card.deleteOne({ _id: card._id })))
            await List.deleteOne({ _id: list._id })
        })
        // find all activities within board and delete them as well
        const activities = await Activity.find({ boardId: _id })
        activities.forEach(async (activity) => {
            await Activity.deleteOne({ _id: activity._id })
        })
        res.send(board)
    } catch (error) {
        next(error)
    }
})


module.exports = router