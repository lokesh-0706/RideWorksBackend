const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ridelead", adminRouter);
app.use("/users", userRouter);
app.get("/", (req, res) => res.json({ msg: "hello world after the class" }));

mongoose.connect(
  "mongodb+srv://lokeshkarri2002:Ab1%40178237048@cluster0.p7ebq0x.mongodb.net/rides",
  { dbName: "rides" }
);

app.listen(3000, () => console.log("Server running on port 3000"));
