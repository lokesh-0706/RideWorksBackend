const mongoose = require("mongoose");

// Define mongoose schemas
const riderSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  received: [{ username: String, rideIdRequested: Number, approved: Number }],
  requested: [
    {
      pickup: String,
      destination: String,
      description: String,
      seats: Number,
      time: String,
      ridelead: String,
      id: Number,
      status: String,
    },
  ],
});

const rideSchema = new mongoose.Schema({
  pickup: String,
  destination: String,
  description: String,
  seats: Number,
  time: String,
  ridelead: String,
  id: Number,
});

// Define mongoose models
const Rider = mongoose.model("Rider", riderSchema);
const Rides = mongoose.model("Rides", rideSchema);

module.exports = {
  Rider,
  Rides,
};
