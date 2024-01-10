import express from "express";

import { createUser, getUserByEmail } from "../db/users";
import { random, authentication } from "../helpers";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("email/password kosong");
      return res.status(400).send("email or password is empty");
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

    if(!user) {
      return res.status(400).send("User ini tidak tersedia");
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password != expectedHash) {
      return res.status(403).send("password salah");
    }

    const salt = random();
    user.authentication.sessionToken = authentication(salt, user._id.toString());

    await user.save();

    res.cookie('USER-AUTH', user.authentication.sessionToken, {domain: 'localhost', path: '/'});

    return res.status(200).json(user).end();

  } catch (error) {
    console.log(error);
    return res.status(400).send("Something went wrong 1");
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      console.log("kosong");
      return res.status(400);
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(400);
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });
    console.log(user);
    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.status(400).send("Something went wrong");
  }
};
