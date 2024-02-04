const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/suggest', async (req, res) => {
    try {
        const userId = req.body.userId;

        const friendList = await Friend.find({
            $or: [{ friend1: userId }, { friend2: userId }],
            isDeleted: false
        });

        const friendIds = friendList.map(friendship =>
            friendship.friend1.toString() === userId ? friendship.friend2 : friendship.friend1
        );

        const allUsers = await User.find({ _id: { $ne: userId } });

        const suggestedUsers = allUsers.filter(user =>
            !friendIds.some(friendId => friendId.toString() === user._id.toString())
        );

        res.json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/new', (req, res) => {
    const newItem = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        date: Date.now()

    });

    newItem.save().then(item => res.json(item));
});

module.exports = router;
