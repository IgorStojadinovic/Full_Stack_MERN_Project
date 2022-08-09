const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");

//This is localhost:3500/notes/
router
  .route("/")
  .get(notesController.getAllNotes)
  .post(notesController.createNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

module.exports = router;
