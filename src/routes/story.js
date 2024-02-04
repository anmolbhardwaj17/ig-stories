const express = require('express');
const User = require('../models/User');
const Friend = require('../models/Friend');
const Story = require('../models/Story');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const friendships = await Friend.find({
            $or: [
                { friend1: userId },
                { friend2: userId }
            ],
            isDeleted: false
        });

        const friendIds = friendships.map(friendship =>
            friendship.friend1.toString() === userId ? friendship.friend2 : friendship.friend1
        );

        friendIds.push(userId);

        const currentTime = new Date();

        const stories = await Story.find({
            userId: { $in: friendIds },
            date: { $gte: new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) },
            isExpired: false,
            //isDeleted: false
        });

        const storiesGroupedByUser = stories.reduce((acc, story) => {
            const userIdKey = story.userId.toString();
            if (!acc[userIdKey]) {
                acc[userIdKey] = {
                    userId: userIdKey,
                    stories: []
                };
            }
            acc[userIdKey].stories.push(story);
            return acc;
        }, {});

        const userIds = Object.keys(storiesGroupedByUser);
        const users = await User.find({ _id: { $in: userIds } });

        const data = users.map(user => {
            const userObj = {
                userId: user._id,
                email: user.email,
                stories: storiesGroupedByUser[user._id.toString()].stories
            };
            return userObj;
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }


});

router.delete('/remove', (req, res) => {

    const { storyId, userId } = req.body;
    const story_id = new mongoose.Types.ObjectId(storyId);
    const user_id = new mongoose.Types.ObjectId(userId);

    // Define the condition to find the friendship
    const condition = {
        _id: story_id, 
        userId: user_id,
    };

    // Define the update to set isDeleted to true
    const update = {
        $set: { isDeleted: true }
    };

    // Update the friendship
    Story.findOneAndUpdate(condition, update, { new: true })
        .then(result => {
            if (result) {
                res.status(200).send('Story marked as deleted.');
            } else {
                // If no document was found and updated, you might want to handle that case too.
                res.status(404).send('Story not found.');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Server error occurred.');
        });
});

router.post('/new', (req, res) => {
    console.log("req.body", req.body)
    const newItem = new Story({
        userId: req.body.userId,
        url: req.body.url
    });

    console.log("newItem", newItem)

    newItem.save().then(item => res.json(item));
});

module.exports = router;
