const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    fees: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: "",
    },
    availableSlots: {
      type: [String],
      default: [
        "09:00 AM", "10:00 AM", "11:00 AM",
        "12:00 PM", "02:00 PM", "03:00 PM",
        "04:00 PM", "05:00 PM"
      ],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);