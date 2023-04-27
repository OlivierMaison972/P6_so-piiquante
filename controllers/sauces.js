const SaucesModel = require("../models/ModelsSauce");
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports.getOneSauce = (req, res, next) => {
    SaucesModel.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

module.exports.getAllSauces = (req, res, next) => {
    SaucesModel.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};


module.exports.createSauce = (req, res, next) => {
    //Création d'une constante pour obtenir un objet utilisable
    const sauceObject = JSON.parse(req.body.sauce);
    //Suppression de l'_id envoyé par le front-end
    delete sauceObject._id;
    //Conversion de l'objet "Sauce" en une chaîne "sauce"
    const sauce = new SaucesModel({
        ...sauceObject,
        //Utilisation de l'URL complète de l'image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    //Enregistre dans la base de données
    sauce.save()
        .then(() => res.status(201).json({ message: "Objet enregistré" }))
        .catch(error => res.status(400).json({error}));
  };


module.exports.modifySauce = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'VAR_TOKEN');
    const userId = decodedToken.userId;
    const sauceObject = req.file ?
        {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

    delete sauceObject._userId;
    SaucesModel.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId == userId) {
                //Crée une instance "Sauce" à partir de "sauceObject"
                SaucesModel.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                    .catch(error => res.status(400).json({ error }));
            } else {
                res.status(403).json({ message: 'Opération non autorisée !' });
            }
        }) .catch(error => res.status(500).json({ error }));
};

module.exports.deleteSauce = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'VAR_TOKEN');
    const userId = decodedToken.userId;
    
    SaucesModel.findOne({ _id: req.params.id })
      .then(sauce => {
          if (sauce.userId == userId) {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
            SaucesModel.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                .catch(error => res.status(400).json({ error }));
            });
           } else {
                res.status(403).json({ message: 'Opération non autorisée !'});
        }
      })
      .catch(error => res.status(500).json({ error }));
};

module.exports.like = (req, res, next) => {
    const like = req.body.like;

    // Pour ajouter un like
    if (like === 1) {
        SaucesModel.findOne({ _id: req.params.id })
            .then((sauce) => {
                //On recherche si l'utilisateur n'a pas déjà liké ou disliké la sauce
                if (sauce.usersDisliked.includes(req.body.userId) || sauce.usersLiked.includes(req.body.userId)) {
                    res.status(401).json({ message: 'Opération non autorisée !'});
                } else {
                    SaucesModel.updateOne({ _id: req.params.id }, {
                        //Insère le userId dans le tableau usersLiked du modèle
                        $push: { usersLiked: req.body.userId },
                        //Ajoute le like
                        $inc: { likes: +1 },
                }) 
                    .then(() => res.status(200).json({ message: 'J\'aime !' }))
                    .catch((error) => res.status(400).json({ error }));
                }
            })
            .catch((error) => res.status(404).json({ error }));
    };
    // Pour ajouter un dislike
    if (like === -1) {
        SaucesModel.findOne({ _id: req.params.id })
            .then((sauce) => {
                //On recherche si l'utilisateur n'a pas déjà liké ou disliké la sauce
                if (sauce.usersDisliked.includes(req.body.userId) || sauce.usersLiked.includes(req.body.userId)) {
                    res.status(401).json({ message: 'Opération non autorisée !'});
                } else {
                    SaucesModel.updateOne({ _id: req.params.id }, {
                        //Insère le userId dans le tableau usersLiked du modèle
                        $push: { usersDisliked: req.body.userId },
                        //Ajoute le dislike
                        $inc: { dislikes: +1 },
                }) 
                    .then(() => res.status(200).json({ message: 'Je n\'aime pas !' }))
                    .catch((error) => res.status(400).json({ error }));
                }
            })
            .catch((error) => res.status(404).json({ error }));
    };

    //RETIRER SON LIKE OU SON DISLIKE

    if (like === 0) {
    SaucesModel.findOne({ _id: req.params.id })
        .then((sauce) => {
            //On recherche si le userId est déjà dans le tableau usersliked/disliked
            if (sauce.usersLiked.includes(req.body.userId)) {
                SaucesModel.updateOne({ _id: req.params.id }, {
                    //Retire le userId dans le tableau usersliked du modèle
                    $pull: { usersLiked: req.body.userId },
                    //Retire le likes
                    $inc: { likes: -1 },
                })
                    .then(() => res.status(200).json({ message: 'J\'aime retiré !' }))
                    .catch((error) => res.status(400).json({ error }))
            };
            if (sauce.usersDisliked.includes(req.body.userId)) {
                SaucesModel.updateOne({ _id: req.params.id }, {
                    //Retire le userId dans le tableau usersDisliked du modèle
                    $pull: { usersDisliked: req.body.userId },
                    //Retire le dislikes
                    $inc: { dislikes: -1 },
                })
                    .then(() => res.status(200).json({ message: 'Je n\'aime pas retiré !' }))
                    .catch((error) => res.status(400).json({ error }))
            };
        })
        .catch((error) => res.status(404).json({ error }));
    };

};