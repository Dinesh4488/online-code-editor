require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcryptjs');
const cors = require('cors');

const SharedCode = require('./models/SharedCode');
const User = require('./models/User');
const ReceivedCode = require('./models/ReceivedCode');

// ---------------------------
// Environment Variables
// ---------------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;   // MUST be provided in Render
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ---------------------------
// Middleware
// ---------------------------
app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));

// ---------------------------
// MongoDB Connection
// ---------------------------
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// ---------------------------
// Routes (no change needed)
// ---------------------------

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const existinguser = await User.findOne({ email: email.toLowerCase() });

    if (existinguser) return res.json({ success: false, message: "Email already exists" });

    const hashpass = await bcrypt.hash(password, 10);
    const newuser = new User({ username, email: email.toLowerCase(), password: hashpass });
    await newuser.save();

    res.json({ success: true, message: "Registration successful" });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.json({ success: false, message: "User not found" });

    const pass = await bcrypt.compare(password, user.password);
    if (!pass) return res.json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, email: user.email });
});

// Share Code
app.post('/share', async (req, res) => {
    const { fileName, codeContent, senderEmail, receiverEmail, link } = req.body;

    const receiver = await User.findOne({ email: receiverEmail.toLowerCase() });
    if (!receiver) return res.status(404).json({ success: false, message: 'Recipient email not registered.' });

    await new SharedCode({ fileName, codeContent, senderEmail, receiverEmail, link }).save();
    await new ReceivedCode({ fileName, codeContent, senderEmail, receiverEmail, link }).save();

    res.json({ success: true, message: "Code shared successfully." });
});

// Shared Codes
app.get('/shared', async (req, res) => {
    const shared = await SharedCode.find({ senderEmail: req.query.email }).sort({ date: -1 });
    res.json(shared);
});

// Received Codes
app.get('/received', async (req, res) => {
    const received = await ReceivedCode.find({ receiverEmail: req.query.email }).sort({ date: -1 });
    res.json(received);
});

// Get Snippet
app.get('/snippet/:id', async (req, res) => {
    try {
        const snippet = await SharedCode.findById(req.params.id);
        if (!snippet) return res.status(404).json({ error: "Snippet not found" });
        res.json(snippet);
    } catch {
        res.status(500).json({ error: "Failed to fetch snippet" });
    }
});

// Delete Shared
app.delete('/shared/:id', async (req, res) => {
    await SharedCode.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Delete Received
app.delete('/received/:id', async (req, res) => {
    await ReceivedCode.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Edit Profile
app.post('/edit-profile', async (req, res) => {
    const { email, oldPassword, newUsername, newEmail, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: false, message: "User not found" });

    const pass = await bcrypt.compare(oldPassword, user.password);
    if (!pass) return res.json({ success: false, message: "Old password is incorrect" });

    if (newEmail && newEmail.toLowerCase() !== user.email) {
        if (await User.findOne({ email: newEmail.toLowerCase() }))
            return res.json({ success: false, message: "Email already exists" });

        user.email = newEmail.toLowerCase();
    }

    if (newUsername) user.username = newUsername;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", username: user.username, email: user.email });
});

// ---------------------------
// Start Server
// ---------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
