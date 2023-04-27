const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const saucesController = require('../controllers/sauces');
const router = express.Router();


router.get("/", auth, saucesController.getAllSauces);

router.get("/:id", auth, saucesController.getOneSauce);

router.post("/", auth, multer, saucesController.createSauce);

router.put("/:id", auth, multer, saucesController.modifySauce);

router.delete("/:id", auth, saucesController.deleteSauce);

router.post("/:id/like", auth, saucesController.like);

module.exports = router;