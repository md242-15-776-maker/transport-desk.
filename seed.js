require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://SM_RAHAT:6iLag7Hs2kt-Rs6@ac-rcaeqjr-shard-00-00.vfj1xz1.mongodb.net:27017,ac-rcaeqjr-shard-00-01.vfj1xz1.mongodb.net:27017,ac-rcaeqjr-shard-00-02.vfj1xz1.mongodb.net:27017/transport-desk?ssl=true&replicaSet=atlas-v92jox-shard-0&authSource=admin&appName=Cluster0";

const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
// Realistic 24-hour start & end slots mapping to G1-G4 and C1-C5
const firstClassTimes = ['07:00', '08:30', '10:00', '12:00'];
const lastClassTimes = ['11:30', '13:30', '15:00', '16:20', '18:10'];
const semesterSystems = ['bi', 'tri'];

// Mongoose schema targeting the 'students' collection
const studentSchema = new mongoose.Schema({
  studentId: String,
  name: String,
  semesterSystem: String,
  routine: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'students' });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

function generateRealisticData(count = 1000) {
  const records = [];

  for (let i = 1; i <= count; i++) {
    const studentId = `242-15-${1000 + i}`;
    const name = `Student ${i}`;
    const semesterSystem = semesterSystems[i % 2];

    const weeklyRoutine = {};
    days.forEach(day => {
      const isOff = Math.random() < 0.15; // 15% chance of day off
      if (isOff) {
        weeklyRoutine[day] = { first: '', last: '' };
      } else {
        const first = firstClassTimes[Math.floor(Math.random() * firstClassTimes.length)];
        const last = lastClassTimes[Math.floor(Math.random() * lastClassTimes.length)];
        weeklyRoutine[day] = { first, last };
      }
    });

    records.push({
      studentId,
      name,
      semesterSystem,
      routine: weeklyRoutine,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date()
    });
  }
  return records;
}

async function runSeed() {
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    console.log("🧹 Clearing old student data...");
    await Student.deleteMany({});

    console.log("⚙️ Generating 1,000 student routine records...");
    const mockData = generateRealisticData(1000);

    console.log("⏳ Inserting 1,000 records into 'students' collection in batches...");
    const chunkSize = 250;
    for (let i = 0; i < mockData.length; i += chunkSize) {
      const chunk = mockData.slice(i, i + chunkSize);
      await Student.insertMany(chunk, { ordered: false });
      console.log(`➡️ Inserted ${i + chunk.length} / 1000 records...`);
    }

    console.log("🎉 Successfully seeded 1,000 records into the 'students' collection!");
    await mongoose.disconnect();
    console.log("🔒 Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

runSeed();