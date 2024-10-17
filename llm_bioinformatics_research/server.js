require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 5001;
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
      password: hashedPassword  
    });

    res.status(201).json(result);  

  } catch (error) {
    res.status(500).json({ error: "Failed to insert user" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
