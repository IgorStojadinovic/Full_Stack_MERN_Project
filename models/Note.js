const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      //Refering to User Schema
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    compleated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//Pluging for auto increments
notesSchema.plugin(AutoInchement,inc_field: 'ticket',id: "ticketNums",start_seq:500);

module.exports = mongoose.model("Note", noteSchema);
