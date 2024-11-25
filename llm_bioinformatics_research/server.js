require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const net = require('net');
const fs = require('fs');
const config = require('./src/config.json');
const { spawn } = require('child_process');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
let port = 5000;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
    }
}
connectDB();

app.post('/signup', async (req, res) => {
    try {
        const { user_name, email, password } = req.body;
        const database = client.db("user_information");
        const collection = database.collection("user_credentials");

        const existingEmail = await collection.findOne({ email: email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        const existingUserName = await collection.findOne({ user_name: user_name });
        if (existingUserName) {
            return res.status(400).json({ message: "Username is already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await collection.insertOne({
            user_name,
            email,
            password: hashedPassword,
            profile_photo: '', 
            phone_number: '',
            location: '',
            theme: 'system'
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to insert user" });
    }
});

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const database = client.db("user_information");
        const collection = database.collection("user_credentials");

        const user = await collection.findOne({
            $or: [{ email: identifier }, { user_name: identifier }]
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid email/username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email/username or password" });
        }

        const token = jwt.sign(
            { id: user._id, username: user.user_name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.user_name,
                email: user.email,
                profile_photo: user.profile_photo,
                phone_number: user.phone_number,
                location: user.location,
                theme: user.theme
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

app.post('/profile', async (req, res) => {
    try {
        const { userId, profile_photo, phone_number, location, theme } = req.body;
        const database = client.db("user_information");
        const collection = database.collection("user_credentials");

        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    profile_photo: profile_photo,
                    phone_number: phone_number,
                    location: location,
                    theme: theme
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "No changes made or user not found." });
        }

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

app.post('/home', async (req, res) => {
    const { userId, theme, language } = req.body;

    try {
        const database = client.db("user_information");
        const collection = database.collection("user_credentials");

        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    profile_photo,
                    phone_number,
                    location,
                    theme: theme,
                    language: language
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "No changes made or user not found." });
        }

        
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Failed to update settings" });
    }
});

// Function to generate and send password reset link
app.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const database = client.db("user_information");
        const collection = database.collection("user_credentials");

        // Check if user exists
        const user = await collection.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        // Generate a secure reset token with an expiration
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token valid for 1 hour
        );

        // Save the token temporarily in the user's record (optional: set expiration)
        await collection.updateOne(
            { _id: user._id },
            { $set: { resetToken, tokenExpiry: new Date(Date.now() + 3600000) } } // 1-hour expiry
        );

        // Send the reset email
        const resetLink = `http://localhost:${port}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(email, resetLink);

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.error("Error generating reset token:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const saltRounds = 10;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const database = client.db("user_information");
        const collection = database.collection("user_credentials");

        // Verify token by matching it with the stored token
        const user = await collection.findOne({ _id: new ObjectId(userId), resetToken: token });
        if (!user || new Date() > user.tokenExpiry) {
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        // Check if the new password is the same as the old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password must be different from the old password." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password and remove the reset token and expiry
        await collection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: "", tokenExpiry: "" }
            }
        );

        res.status(200).json({ message: "Password reset successfully. Redirecting to login." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Failed to reset password. Please try again later." });
    }
});

app.get('/reset-password', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send("Invalid or missing token.");
    }

    // Redirect to the frontend app with the token as a query parameter
    res.redirect(`http://localhost:3000/reset-password?token=${token}`);
});

const axios = require('axios');
const querystring = require('querystring');

app.post('/github/signup', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `http://localhost:${port}/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;

    res.json({ url: githubAuthUrl });
});

app.get('/github/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', querystring.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,   
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
            redirect_uri: `http://localhost:${port}/github/callback`
        }), {
            headers: {
                'Accept': 'application/json'
            },
        });

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authrorization: 'Bearer ' + accessToken,
            },
        });

        const user = userResponse.data;

        const database = client.db("user_information");
        const collection = database.collection("user_credentials");

        const existingUser = await collection.findOne({ $or: [{ email: user.email }, { user_name: user.login }] });

        if (existingUser) {
            res.status(200).json({ message: "User already exists" });
        } else {
            const result = await collection.insertOne({
                user_name: user.login,
                email: user.email,
                password: '',
                profile_photo: user.avatar_url,
                phone_number: '',
                location: '',
                theme: 'system'
            });
        }

    } catch (error) {
        console.error("Error during Github OAuth callback:", error);
        res.status(500).json({ message: "Failed to authenticate with Github" });
    }
});


function findAvailablePort(initialPort) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(initialPort, () => {
            server.once('close', () => {
                port = initialPort;
                resolve(initialPort);
            });
            server.close();
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${initialPort} is in use, checking next one...`);
                resolve(findAvailablePort(initialPort + 1));
            } else {
                reject(err);
            }
        });
    });
}

function writePortToConfig(availablePort) {
    config.port = availablePort;

    fs.writeFile('./src/config.json', JSON.stringify(config, null, 2), (err) => {
        if (err) {
            console.error("Error writing to config.json", err);
        } else {
            console.log(`Updated config.json with port ${availablePort}`);
        }
    });
}

findAvailablePort(port).then((availablePort) => {
    writePortToConfig(availablePort);
    app.listen(availablePort, () => {
        console.log(`Server running on port ${availablePort}`);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
});

async function sendPasswordResetEmail(toEmail, resetLink) {
    const msg = {
        to: toEmail,
        from: process.env.EMAIL_USER, // Verified sender email in SendGrid
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset.</p>
               <p>Click the link below to reset your password:</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>This link is valid for 1 hour.</p>`
    };

    try {
        await sgMail.send(msg);
        console.log("Password reset email sent to:", toEmail);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Could not send reset email.");
    }
}