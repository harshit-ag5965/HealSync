const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.collection("patients").updateOne(
    { _id: new mongoose.Types.ObjectId("69ed1e22910acca51dc81f6f") },
    { $set: { user: new mongoose.Types.ObjectId("6a294c90ec877a5acbb94ccf") } }
  );
  console.log("✅ Patient user field updated!");
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});