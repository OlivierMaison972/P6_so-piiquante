const UsersModel = require("../models/user");

// Pour hacher le mot de passe
const bcrypt = require('bcrypt');

// Pour verifier l'authentification
const jwt = require('jsonwebtoken');

module.exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new UsersModel({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => {
          res.status(400).json({ message :"email déjà utilisé" });
        })
    })
    .catch(error => res.status(500).json({ error }));
};


module.exports.login = (req, res, next) => {
  // recherche pour savoir si l'utilisateur existe dans la BDD
    UsersModel.findOne({ email: req.body.email})
              .then(user => {
                if (!user){
                  return res.status(401).json({ error:"cet utilisateur n'existe pas"});
                }
                // sinon s'il existe, comparaison entre le MDP entré et celui dans la BDD
                bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                  if (!valid){
                    return res.status(401).json({ error:"Mot de de passe erroné"});
                  }
                  res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                      { userId: user._id },
                      
                      'VAR_TOKEN',
                      { expiresIn: '24h' })
                  });
                })
                .catch(error => res.status(500).json({ error }))
              })
              .catch(error => res.status(500).json({ error }))

};