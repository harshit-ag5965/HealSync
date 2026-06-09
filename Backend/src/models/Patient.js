const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    medicalHistory: {
      type: String,
      default: "None",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // links patient to a User account
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);