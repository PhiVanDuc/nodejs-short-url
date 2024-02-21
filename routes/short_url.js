const express = require('express');
const router = express.Router();
const shortUrlController = require('../controllers/short_url');

router.get("/", shortUrlController.index);
router.post("/", shortUrlController.handleAdd);

router.get("/edit/:id", shortUrlController.edit);
router.post("/edit/:id", shortUrlController.handleEdit);

router.post("/delete/:id", shortUrlController.handleDelete);

router.get("/:custom_path", shortUrlController.access);
router.post("/:custom_path", shortUrlController.handleAccess);

module.exports = router;