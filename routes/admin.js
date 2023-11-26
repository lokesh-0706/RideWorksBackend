const mongoose = require("mongoose");
const express = require('express');
const { Rider, Rides } = require("../db");
const jwt = require('jsonwebtoken');
const { secret } = require("../middleware/auth")
const { authenticateJson } = require("../middleware/auth");

const router = express.Router();

//verified - Signup component
router.post("/signup", (req, res) => {
    const { username, password } = req.body;
    function callback(admin) {
      if (admin) {
        res.status(403).json({ message: "Admin already exists" });
      } else {
        const obj = { username: username, password: password };
        const newRider = new Rider(obj);
        newRider.save();
        const token = jwt.sign({ username, role: "admin" }, secret, {
          expiresIn: "1H",
        });
        res.status(200).json({ message: "Lead Signed up Succesfully", token });
      }
    }
    Rider.findOne({ username }).then(callback);
  });
  
  //verified- Login Component
  router.post("/login", async (req, res) => {
    const { username, password } = req.headers;
    const rider = await Rider.findOne({ username, password });
    if (rider) {
      const token = jwt.sign({ username, role: "admin" }, secret, {
        expiresIn: "1h",
      });
      res.json({ message: "Logged in successfully", token });
    } else {
      res.status(403).json({ message: "Invalid username or password" });
    }
  });
  
  //verified - Appbar Component
  router.get("/me", authenticateJson, (req, res) => {
    if (req.user.role != "admin") {
      res.status(401).json({ message: "Admin Does not Exist" });
    } else {
      res.status(200).json({ username: req.user.username });
    }
  });
  
  //verified- AddRide Component
  router.post("/rides", authenticateJson, async (req, res) => {
    if (req.user.role != "admin") {
      res.status(401).json({ message: "Admin Does not Exist" });
    } else {
      const ride = new Rides(req.body);
      ride["ridelead"] = req.user.username;
      const allRides = await Rides.find({});
      if (allRides.length > 0) {
        ride["id"] = allRides[allRides.length - 1]["id"] + 1;
      } else {
        ride["id"] = 1;
      }
      await ride.save();
      res.json({ message: "Ride created successfully", courseId: ride.id });
    }
  });
  
  //verified- Update Ride- Ride Component
  router.put("/rides/:rideId", authenticateJson, async (req, res) => {
    if (req.user.role != "admin") {
      res.status(401).json({ message: "Admin Does not Exist" });
    } else {
      const rideId = req.params.rideId;
      const rideIdMon = await Rides.findOne({ id: rideId });
      const ride = await Rides.findByIdAndUpdate(rideIdMon._id, req.body, {
        new: true,
      });
      if (ride) {
        res.json({ message: "Ride updated successfully" });
      } else {
        res.status(404).json({ message: "Ride not found" });
      }
    }
  });
  
  router.delete("/rides/:rideId", authenticateJson, async (req, res) => {
    // logic to edit a course
    if (req.user.role != "admin") {
      res.status(401).json({ message: "Admin Does not Exist" });
    } else {
      const rideId = req.params.rideId;
      const rideIdMon = await Rides.findOne({ id: rideId });
      const ride = await Rides.findByIdAndDelete(rideIdMon._id);
      const rideIndex = await Rides.findOne({ id: rideId });
      if (!rideIndex) {
        res.status(200).json({ message: "Ride Deleted successfully" });
      }
    }
  });
  
  //verified- My Rides- Rides component
  router.get("/rides", authenticateJson, async (req, res) => {
    const rides = await Rides.find({});
    var filtrides = rides.filter((a) => a.ridelead == req.user.username);
    res.status(200).json({ rides: filtrides });
  });
  
  //verified- Ride Edit- Ride Component
  router.get("/rides/:rideId", authenticateJson, async (req, res) => {
    // logic to edit a course
    if (req.user.role != "admin") {
      res.status(401).json({ message: "Admin Does not Exist" });
    } else {
      const rideId = req.params.rideId;
      const rideIndex = await Rides.findOne({ id: rideId });
      if (rideIndex) {
        res.json({ ride: rideIndex });
      } else {
        res.status(404).json({ message: "Ride not found" });
      }
    }
  });

  module.exports = router