const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const crypto = require('crypto')

const Post = mongoose.model('Post');

const router = express.Router();

const encrypt = function (content) {
    console.log('con', content)
    try {
        const key = process.env.CRYPTO_KEY;
        let cipher = crypto.createCipheriv('des-ede3', key, "");
        let encrypted = cipher.update(content, 'utf-8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (e) {
        /* silence */
    }
}

router.use(requireAuth);

router.get('/posts', async (req, res) => {
    const post = await Post.find({ userId: req.user._id });
    for (let i = 0; i < post.length; i++) {
        post[i].decrypt()
    }
    res.send(post);
});

router.get('/search', async (req, res) => {
    const title = req.query.title;
    let condition = title ? { userId: req.user._id, title: { $regex: new RegExp(title), $options: "i" } } : {};
    const post = await Post.find(condition);
    for (let i = 0; i < post.length; i++) {
        post[i].decrypt()
    }
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


router.put('/update/:id', async (req, res) => {
    const { title, lastEdited } = req.body;
    let { content } = req.body;

    if (!title || !content) return res.status(422).send({ error: 'Must provide title and content!' })

    try {
        content = await encrypt(content)
        const post = Post.findOneAndUpdate({ _id: req.params.id }, {title, content, lastEdited }, async (e, post) => {
            if (e) return res.status(422).send({ error: e.message });
            res.send(post);
        })

    } catch (e) {
        return res.status(422).send({ error: e.message })
    }
})

router.get('/starred', async (req, res) => {
    const post = await Post.find({ userId: req.user._id, starred: true })
    for (let i = 0; i < post.length; i++) {
        post[i].decrypt()
    }
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