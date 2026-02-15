import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
