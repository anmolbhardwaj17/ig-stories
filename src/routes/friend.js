const express = require('express');
const User = require('../models/User');
const Friend = require('../models/Friend');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.get('/:id', (req, res) => {

    const userId = req.params.id;
    console.log("userId", userId)

    Friend.find({
        $or: [
            { friend1: userId },
            { friend2: userId }
        ]
    })
        .sort({ date: -1 })
        .then(friends => res.json(friends))
        .catch(err => res.status(400).json({ error: err.message }));
});

router.delete('/remove', (req, res) => {

    const { userId, friendId } = req.body;
    const friend1_id = new mongoose.Types.ObjectId(userId);
    const friend2_id = new mongoose.Types.ObjectId(friendId);

    // Define the condition to find the friendship
    const condition = {
        $or: [
            { friend1: friend1_id, friend2: friend2_id },
            { friend1: friend2_id, friend2: friend1_id }
        ]
    };

    // Define the update to set isDeleted to true
    const update = {
        $set: { isDeleted: true }
    };

    // Update the friendship
    Friend.findOneAndUpdate(condition, update, { new: true })
        .then(result => {
            if (result) {
                res.status(200).send('Friendship marked as deleted.');
            } else {
                // If no document was found and updated, you might want to handle that case too.
                res.status(404).send('Friendship not found.');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Server error occurred.');
        });
});

router.post('/new', (req, res) => {
    console.log("req.body", req.body)
    const newItem = new Friend({
        friend1: req.body.friend1,
        friend2: req.body.friend2,
        status: req.body.status,
        date: Date.now()

    });

    console.log("newItem", newItem)

    newItem.save()
        .then(item => res.json(item))
        .catch(err => {
            if (err.code === 11000) {
                res.status(409).json({ message: 'Friend relationship already exists' });
            } else {
                res.status(500).json({ error: err.message });
            }
        });
});

module.exports = router;
