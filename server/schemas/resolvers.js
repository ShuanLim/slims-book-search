const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if(context.user) {
        return User.findOne({ _id: context.user.id })
      }
    }
  },

  Mutation: {
    loginUser: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No profile found!');
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }
      const token = signToken(user);
      return { token, user };
    },

    addUser: async (_parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (_parent, { input }, context) => {

      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: input },
          },
          { new: true }
        )
      }
    },

    removeBook: async (_parent, { bookId }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
      }
    },
  }
};

module.exports = resolvers; 