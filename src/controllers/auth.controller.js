import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const { token, user } = await authService.registerUser({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await authService.loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};
