const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler"); // asyncHandeler will keep us from using so many try catch block as we use async methods with mongoose to save,delete or find data from mongo db
const bcrypt = require("bcrypt");

//@desc Get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  //Send all user date except password
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

/***************************************************************************************************************/

//@desc Create new user
//@route POST /users
//@access Public
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  //Confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //Check for duplicates in DB
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //Hash the password
  const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

  const userObject = { username, password: hashedPwd, roles };

  //Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //Created User
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data recived" });
  }
});

/***************************************************************************************************************/

//@desc Update User
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const { _id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !_id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(_id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== _id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

/***************************************************************************************************************/

//@desc Delete User
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ message: "User ID Required !" });
  }

  const notes = await Note.findOne({ user: _id }).lean().exec();

  if (notes?.length) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(_id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted !`;

  res.json(reply);
});

/***************************************************************************************************************/

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
