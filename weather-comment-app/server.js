// server.js
const express = require('express'); // import the Express framework
const bcrypt = require('bcryptjs'); // import bcrypt
const jwt = require('jsonwebtoken');
const app = express(); // create an Express application
const port = 3000 // Define the port number for the server
const JWT_SECRET = 'My$ecretK3yForJWT!987';

const users = [
    {
        username: 'sara',
        password: '$2a$10$GUtCS10xYdj5e0TOH4LZj.AS1gZtolp1GWfdpLeQj1MtJ2c7z0MSC'  // Ce champ ne sera pas utilisé pour l'instant
    }
];

// Middleware to parse the request bodies
app.use(express.json());

// Basic route - Home page
app.get('/', async (req, res) => {
    res.send('Hello world !'); // Send a response when someone visits the root URL
});


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
        req.user = user;
        next();
    })

}

app.get('/kiki', authenticateJWT, (req, res) => {
    res.json('it worked');

})

// Login route 
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Cherche si l'utilisateur existe
    let user = users.find(u => u.username === username);
    // console.log(user);

    if (!user) {
        // Si l'utilisateur n'existe pas, créer un nouvel utilisateur avec un mot de passe haché
        const hashedPwd = await bcrypt.hash(password, 10);
        const newUser = {
            username: username,
            password: hashedPwd
        };

        users.push(newUser);
        user = newUser;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid credentials');
    }

    // generer un token pour l'utilisateur
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token })

})


// Start a server on the port 3000
app.listen(port, () => {
    console.log(`Server is running on: http:localhost:${port}`);
});
