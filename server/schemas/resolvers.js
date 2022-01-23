const { User } = require("../models/index");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log(context.user);
      if (context.user) {
        const user = await User.findOne({
          _id: context.user._id,
        });
        return user;
      }
      throw new AuthenticationError("User not logged in");
    },
  },
  Mutation: {
    login: async (parent, args, context) => {
      const user = await User.findOne({
        email: args.email,
      });
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(args.password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async ({ user, body }, response) => {
      console.log(user);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("No saved books");
      }
    },
    remvoveBook: async (parent, { bookId }, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new AuthenticationError("Couldnt find user with this id");
      }
      return updatedUser;
    },
  },
};

module.exports = resolvers;
