const Follow = require('../models/Follow');

const publicUserProjection = 'username displayName name avatar bio createdAt';

const create = (payload) => Follow.create(payload);

const deleteOne = (filters = {}) => Follow.findOneAndDelete(filters).exec();

const exists = async (filters = {}) => Boolean(await Follow.exists(filters));

const countDocuments = (filters = {}) => Follow.countDocuments(filters);

const findFollowingIdsByFollower = async (followerId) => {
  const items = await Follow.find({ follower: followerId })
    .select('following')
    .lean()
    .exec();

  return items.map((item) => item.following);
};

const findFollowersByUserId = (userId) => Follow.find({ following: userId })
  .sort({ createdAt: -1 })
  .populate({
    path: 'follower',
    select: publicUserProjection,
  })
  .exec();

const findFollowingByUserId = (userId) => Follow.find({ follower: userId })
  .sort({ createdAt: -1 })
  .populate({
    path: 'following',
    select: publicUserProjection,
  })
  .exec();

module.exports = {
  create,
  deleteOne,
  exists,
  countDocuments,
  findFollowingIdsByFollower,
  findFollowersByUserId,
  findFollowingByUserId,
};
