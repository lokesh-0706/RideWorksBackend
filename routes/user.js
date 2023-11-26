const express = require("express");
const { authenticateJson, secret } = require("../middleware/auth");
const { Rider, Rides } = require("../db");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const router = express.Router();

//verified- Available Rides- Home Component
router.get("/rides", authenticateJson, async (req, res) => {
  if (req.user.role != "admin") {
    res.status(401).json({ message: "User Does not Exist" });
  } else {
    const rides = await Rides.find({});
    res.status(200).json({ rides: rides, username: req.user.username });
  }
});

router.post("/rides/:rideId", authenticateJson, async (req, res) => {
  // logic to purchase a course
  if (req.user.role != "admin") {
    res.status(401).json({ message: "User Does not Exist" });
  } else {
    const rideId = req.params.rideId;
    const rideIndex = await Rides.findOne({ id: rideId }); //leadid
    const userIndex = await Rider.findOne({ username: req.user.username }); //userid
    if (userIndex) {
      if (!userIndex["requested"]) {
        userIndex["requested"] = [];
      }
      const ind = userIndex["requested"].findIndex((a) => a["id"] == rideId);
      if (ind == -1) {
        userIndex["requested"].push({
          pickup: rideIndex.pickup,
          description: rideIndex.description,
          destination: rideIndex.destination,
          time: rideIndex.time,
          seats: rideIndex.seats,
          ridelead: rideIndex.ridelead,
          id: rideIndex.id,
        });
        const newind = userIndex["requested"].findIndex(
          (a) => a["id"] == rideId
        );
        userIndex["requested"][newind]["status"] = "Waiting For Approval";
        const indx = await Rider.findOne({ username: rideIndex.ridelead });
        if (!indx["received"]) {
          indx["received"] = [];
        }
        indx["received"].push({
          username: userIndex.username,
          rideIdRequested: rideId,
          approved: 0,
        });
        await userIndex.save();
        await indx.save();
      }
    }
    res.status(200).json({ message: "Ride requested successfully" });
  }
});

router.get("/requestedRides", authenticateJson, async (req, res) => {
  // logic to view purchased courses
  if (req.user.role != "admin") {
    res.status(401).json({ message: "User Does not Exist" });
  } else {
    const userIndex = await Rider.findOne({ username: req.user.username });
    res.status(200).json({ requestedRides: userIndex["requested"] || [] });
  }
});

router.post("/approveRide", authenticateJson, async (req, res) => {
  // logic to view purchased courses
  if (req.user.role != "admin") {
    res.status(401).json({ message: "User Does not Exist" });
  } else {
    const username = req.body.username;
    const rideId = req.body.rideId;
    const rideleadname = req.user.username;

    const rideleadIndex = await Rider.findOne({ username: rideleadname });
    const userIndex = await Rider.findOne({ username: username });
    const requestedRide = userIndex["requested"].findIndex(
      (a) => a["id"] == rideId
    );
    // const seatIndex= RIDER[rideleadIndex].findIndex((a)=>a.)

    const requester = rideleadIndex["received"].findIndex(
      (a) => a.username == username && a.rideIdRequested == rideId
    );
    rideleadIndex["received"][requester]["approved"] = 1;
    userIndex["requested"][requestedRide]["status"] = "Approved";
    const seatIndex = await Rides.findOne({ id: rideId });
    seatIndex["seats"] = seatIndex["seats"] - 1;
    await seatIndex.save();
    await rideleadIndex.save();
    await userIndex.save();
    res.status(200).json({ requestedRides: userIndex["requested"] || [] });
  }
});

router.post("/rejectRide", authenticateJson, async (req, res) => {
  if (req.user.role != "admin") {
    res.status(401).json({ message: "User Does not Exist" });
  } else {
    const username = req.body.username;
    const rideId = req.body.rideId;
    const rideleadname = req.user.username;
    const rideleadIndex = await Rider.findOne({ username: rideleadname });
    const userIndex = await Rider.findOne({ username: username });
    const requestedRide = userIndex["requested"].findIndex(
      (a) => a["id"] == rideId
    );
    const requester = rideleadIndex["received"].findIndex(
      (a) => a.username == username && a.rideIdRequested == rideId
    );
    rideleadIndex["received"][requester]["approved"] = -1;
    userIndex["requested"][requestedRide]["status"] = "Rejected";
    await rideleadIndex.save();
    await userIndex.save();
    res.status(200).json({ requestedRides: userIndex["requested"] || [] });
  }
});

router.post("/cancelRequest", authenticateJson, async (req, res) => {
  // logic to cancel request
  if (req.user.role != "admin") {
    res.status(401).json({ message: "User Does not Exist" });
  } else {
    const rideleadname = req.body.username;
    const rideId = req.body.rideId;
    const username = req.user.username;
    const rideleadIndex = await Rider.findOne({ username: rideleadname });
    const userIndex = await Rider.findOne({ username: username });
    const requestedRide = userIndex["requested"].findIndex(
      (a) => a["id"] == rideId
    );
    const requester = rideleadIndex["received"].findIndex(
      (a) => a.username == username && a.rideIdRequested == rideId
    );
    const seatIndex = await Rides.findOne({ id: rideId });
    if (rideleadIndex["received"][requester]["approved"] == 1) {
      seatIndex["seats"] = seatIndex["seats"] + 1;
      await seatIndex.save();
    }
    rideleadIndex["received"][requester]["approved"] = -2;
    userIndex["requested"][requestedRide]["status"] = "Request Cancelled";
    await rideleadIndex.save();
    await userIndex.save();
    res.status(200).json({ requestedRides: userIndex["requested"] || [] });
  }
});

router.get("/receivedRequests", authenticateJson, async (req, res) => {
  // logic to view purchased courses
  if (req.user.role != "admin") {
    res.status(401).json({ message: "User Does not Exist" });
  } else {
    const userIndex = await Rider.findOne({ username: req.user.username });

    res.status(200).json({ receivedRequests: userIndex["received"] || [] });
  }
});

module.exports = router;
