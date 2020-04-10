const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const validator = require('validator');
const User = mongoose.model('User');
const router = express.Router();

router.post('/signup', async (req, res) => {
	const { email, password } = req.body;
	
	if (!validator.isEmail(email)) return res.status(422).send({ error: "Invalid email!" });
	if (password.length < 8) return res.status(422).send({ error: "Password too short!" });
	
	try {
		const user = new User({ email, password })
		await user.save();

		const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY)
		res.send({ token })
	} catch (e) {
		if (e.name === 'MongoError' && e.code === 11000) {
			return res.status(500).send({ error: 'Email already signed up!' });
		  }
		res.status(422).send({ error: "Something went wrong" });
	}
});

router.post('/signin', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(422).send({ error: 'Must provide email and password!' })
	
	const user = await User.findOne({ email });
	if (!user) return res.status(422).send({ error: 'Invalid email or password!' })
	
	try {
		await user.comparePassword(password);
		const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY)
		console.log(process.env.SECRET_KEY)
		res.send({ token })
	} catch(e) {
		return res.status(422).send({ error: "Invalid email or password" });
	}

})

module.exports = router;