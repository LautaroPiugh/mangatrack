require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/db');
const Follow = require('../models/Follow');
const User = require('../models/User');

const migrateFollows = async () => {
  const users = await User.find({})
    .select('_id following')
    .lean()
    .exec();

  let migratedCount = 0;

  for (const user of users) {
    const followingList = Array.isArray(user.following) ? user.following : [];

    for (const followingId of followingList) {
      if (!followingId || followingId.toString() === user._id.toString()) {
        continue;
      }

      const result = await Follow.updateOne(
        {
          follower: user._id,
          following: followingId,
        },
        {
          $setOnInsert: {
            follower: user._id,
            following: followingId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          upsert: true,
        },
      );

      if (result.upsertedCount > 0) {
        migratedCount += 1;
      }
    }
  }

  console.log(`Migración de follows completada. Nuevas relaciones creadas: ${migratedCount}.`);
};

const run = async () => {
  try {
    await connectDB();
    await migrateFollows();
  } catch (error) {
    console.error('No se pudo migrar follows:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();
