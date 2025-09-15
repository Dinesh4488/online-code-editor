const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bycrypt = require('bcryptjs');
const cors = require('cors');
const SharedCode = require('./models/SharedCode');
const User = require('./models/User');
const ReceivedCode = require('./models/ReceivedCode');

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
mongoose.connect('mongodb://localhost:27017/project')

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const existinguser = await User.findOne({ email: email.toLowerCase() });
    if (existinguser) {
        return res.json({ success: false, message: "Email already exists" });
    }
    const hashpass = await bycrypt.hash(password, 10);
    const newuser = new User({ username, email: email.toLowerCase(), password: hashpass });
    await newuser.save();
    res.json({ success: true, message: "Registration successful" });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.json({ success: false, message: "User not found" });
    }
    const pass = await bycrypt.compare(password, user.password);
    if (!pass) {
        return res.json({ success: false, message: "Invalid credentials" });
    }
    res.json({ success: true, email: user.email });
});

// Share code endpoint
app.post('/share', async (req, res) => {
    console.log('SHARE BODY:', req.body); // Debug log
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'No data received. Make sure Content-Type is application/json.' });
    }
    const { fileName, codeContent, senderEmail, receiverEmail, link } = req.body;
    console.log('Looking for user:', receiverEmail);
    // Check if receiver exists (case-insensitive)
    const receiver = await User.findOne({ email: receiverEmail.toLowerCase() });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient email not registered.' });
    }
    // Save shared code
    const shared = new SharedCode({ fileName, codeContent, senderEmail, receiverEmail, link });
    await shared.save();
    // Save received code for receiver
    const received = new ReceivedCode({ fileName, codeContent, senderEmail, receiverEmail, link });
    await received.save();
    res.json({ success: true, message: 'Code shared successfully.' });
});

// Get shared codes by sender
app.get('/shared', async (req, res) => {
    const { email } = req.query;
    const shared = await SharedCode.find({ senderEmail: email }).sort({ date: -1 });
    res.json(shared);
});

// Get received codes by receiver (from ReceivedCode)
app.get('/received', async (req, res) => {
    const { email } = req.query;
    const received = await ReceivedCode.find({ receiverEmail: email }).sort({ date: -1 });
    res.json(received);
});

// Get snippet by ID
app.get('/snippet/:id', async (req, res) => {
    try {
        const snippet = await SharedCode.findById(req.params.id);
        if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
        res.json(snippet);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch snippet' });
    }
});

// Delete shared code by ID
app.delete('/shared/:id', async (req, res) => {
    await SharedCode.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Delete received code by ID
app.delete('/received/:id', async (req, res) => {
    await ReceivedCode.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Edit profile endpoint
app.post('/edit-profile', async (req, res) => {
    const { email, oldPassword, newUsername, newEmail, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.json({ success: false, message: "User not found" });
    }
    // Verify old password
    const pass = await bycrypt.compare(oldPassword, user.password);
    if (!pass) {
        return res.json({ success: false, message: "Old password is incorrect" });
    }
    // Check for email uniqueness if changing email
    if (newEmail && newEmail.toLowerCase() !== user.email) {
        const existing = await User.findOne({ email: newEmail.toLowerCase() });
        if (existing) {
            return res.json({ success: false, message: "Email already exists" });
        }
        user.email = newEmail.toLowerCase();
    }
    if (newUsername) {
        user.username = newUsername;
    }
    if (newPassword) {
        user.password = await bycrypt.hash(newPassword, 10);
    }
    await user.save();
    res.json({ success: true, message: "Profile updated successfully", username: user.username, email: user.email });
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
})