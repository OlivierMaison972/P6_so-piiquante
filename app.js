const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
//Permet d'accéder au path du serveur
const path = require('path');

const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces')
const app = express();

mongoose.connect(process.env.MONGO_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
 });

//Gère la ressource "images" de manière statique à chaque fois qu'elle reçoit une requête vers la route "/images"
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes de base pour l'authentification et les sauces
app.use("/api/auth" , userRoutes);
app.use("/api/sauces", saucesRoutes);

module.exports = app;