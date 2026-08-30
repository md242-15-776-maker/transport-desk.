require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://SM_RAHAT:6iLag7Hs2kt-Rs6@ac-rcaeqjr-shard-00-00.vfj1xz1.mongodb.net:27017,ac-rcaeqjr-shard-00-01.vfj1xz1.mongodb.net:27017,ac-rcaeqjr-shard-00-02.vfj1xz1.mongodb.net:27017/transport-desk?ssl=true&replicaSet=atlas-v92jox-shard-0&authSource=admin&appName=Cluster0";

async function inspect() {
  await mongoose.connect(MONGODB_URI);
  
  // List all collections in transport-desk
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("📂 Collections found:", collections.map(c => c.name));

  for (const col of collections) {
    const sample = await mongoose.connection.db.collection(col.name).findOne({});
    if (sample) {
      console.log(`\n📄 Sample Document from collection "${col.name}":`);
      console.log(JSON.stringify(sample, null, 2));
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

inspect();