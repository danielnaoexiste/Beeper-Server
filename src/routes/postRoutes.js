const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const Post = mongoose.model('Post');

const router = express.Router();

mongoose.set('useFindAndModify', true);

router.use(requireAuth);

router.get('/posts', async (req, res) => {
    const post = await Post.find({ userId: req.user._id });

    res.send(post);
});

router.post('/posts', async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(422).send({ error: 'Must provide title and content!' })
    try {
        const post = new Post({ title, content, userId: req.user._id })
        await post.save();
        res.send(post);
    } catch (e) {
        return res.status(422).send({ error: e.message })
    }
})

router.delete('/remove/:id', function (req, res) {
    Post.delete({ _id: req.params.id }, function (e, post) {
        if (e) {
            return res.status(422).send({ error: e.message })
        }
        res.send({ message: "Post deleted successfully" })
    })
})

router.put('/update/:id', function (req, res) {
    const { title, content, lastEdited } = req.body
    Post.update({ _id: req.params.id }, { title, content, lastEdited }, function (e, post) {
        if (e) return res.status(422).send({ error: e.message })


        res.send({ message: "Post updated successfully" })
    })
})

router.get('/starred', async (req, res) => {
    const post = await Post.find({ userId: req.user._id, starred: true })
    console.log(post)
    res.send(post)
})

router.put('/starred/:id', async (req, res) => {
    const { starred } = req.body;
    Post.update({ _id: req.params.id }, { starred }, function(e, post) {
        if (e) return res.status(422).send({ error: e.message })
        res.send({ message: "Post star updated succesfully"})
    })
})


module.exports = router;