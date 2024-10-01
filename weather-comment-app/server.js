// server.js
const express = require('express'); // import the Express framework
const bcrypt = require('bcryptjs'); // import bcrypt
const jwt = require('jsonwebtoken');
const app = express(); // create an Express application
const port = 3000; // Define the port number for the server
const JWT_SECRET = 'My$ecretK3yForJWT!987';
const mongoose = require('mongoose');
const mongUrl = 'mongodb://localhost:27017/weatherApp'; // for my local MongoDB

// Middleware to parse the request bodies
app.use(express.json());

// Middleware pour vérifier le JWT
function authenticateJWT(req, res, next) {
    // Récupérer le token depuis l'en-tête "Authorization"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Si aucun token trouvé, renvoyer une erreur
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    // Vérifier la validité du token
    const verifiedToken = jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "token invalide" });
        }

        // Storing the decoded user information (from the token) in req.user
        // console.log(user);
        req.user = user;
        next();
    })
}

// Connexion mongooseDB
mongoose.connect(mongUrl)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define a schema for users
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Define a schema for comments
const commentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Create a Comment model based on the schema
const Comment = mongoose.model('Comment', commentSchema);


// Add comment route
app.post('/api/comments',authenticateJWT, async (req, res) => {
    const { username, comment } = req.body;

    try {
        const newComment = new Comment({
            username: username,
            comment: comment
        });

        await newComment.save();
        res.status(201).json({ message: 'Comment added succesfully' });

    } catch (err) {
        res.status(500).json({ error: 'Error adding comment', details: err });
    }
});


// retrieve comments route using then/catch function
// app.get('/api/comments', authenticateJWT, (req, res) => {
//     const comments = Comment.find()
//         .then(comments => res.json({comments: comments}))
//         .catch(err =>  res.json({error: err}));
// });

// retrieve comments route using async/await with try/catch
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json({comments: comments});
  } catch (err) {
    res.status(500).json({error: 'Error retrieving the comments', details: err});
  }

    
});


// Basic route - Home page
app.get('/', async (req, res) => {
    res.send('Hello world !'); // Send a response when someone visits the root URL
});


// route to test the authenticateJWT
app.get('/api/protected', authenticateJWT, (req, res) => {
    res.json('it worked');

});

// Login route 
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Cherche si l'utilisateur existe
        let user = await User.findOne({ username: username })
        
        if (!user) {
            // Si l'utilisateur n'existe pas, créer un nouvel utilisateur avec un mot de passe haché
            const hashedPwd = await bcrypt.hash(password, 10);
            const newUser = new User({
                username: username,
                password: hashedPwd
            });
            await newUser.save();
            user = newUser;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send('Invalid credentials');
        }

        // generer un token pour l'utilisateur
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token })

    } catch (error) {
        // console.log(error);
        res.status(500).send('Internal server error');
    }
});




// Start a server on the port 3000
app.listen(port, () => {
    console.log(`Server is running on: http:localhost:${port}`);
});
