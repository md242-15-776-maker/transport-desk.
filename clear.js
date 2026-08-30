require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://SM_RAHAT:6iLag7Hs2kt-Rs6@ac-rcaeqjr-shard-00-00.vfj1xz1.mongodb.net:27017,ac-rcaeqjr-shard-00-01.vfj1xz1.mongodb.net:27017,ac-rcaeqjr-shard-00-02.vfj1xz1.mongodb.net:27017/transport-desk?ssl=true&replicaSet=atlas-v92jox-shard-0&authSource=admin&appName=Cluster0";

async function clearData() {
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    
    console.log("🧹 Wiping all records from 'students' and 'routines' collections...");
    await mongoose.connection.db.collection('students').deleteMany({});
    await mongoose.connection.db.collection('routines').deleteMany({});

    console.log("✅ All dummy data successfully removed! The database is now clean.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to clear database:", err);
    process.exit(1);
  }
}

clearData();