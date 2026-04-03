import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/spice-haven";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB for Database wipe...");
    try {
      // Drop all the previous collections to start completely fresh
      await mongoose.connection.db.dropCollection("users").catch(() => console.log("Users already empty"));
      await mongoose.connection.db.dropCollection("vendors").catch(() => console.log("Vendors already empty"));
      await mongoose.connection.db.dropCollection("menus").catch(() => console.log("Menus already empty"));
      await mongoose.connection.db.dropCollection("orders").catch(() => console.log("Orders already empty"));
      await mongoose.connection.db.dropCollection("payments").catch(() => console.log("Payments already empty"));
      await mongoose.connection.db.dropCollection("temppayments").catch(() => console.log("TempPayments already empty"));
      
      console.log("Entire previous database structure has been successfully deleted!");
      process.exit(0);
    } catch (err) {
      console.error("Error during deletion:", err);
      process.exit(1);
    }
  });
