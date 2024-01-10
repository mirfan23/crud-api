import express from "express";
import { get, merge } from "lodash";

import { getUserBySessionToken } from "../db/users";

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, "identity._id") as String;

    if (!currentUserId) {
        console.log('gagal menghapus');
      return res.status(403).send('gagal menghapus');
    }

    if (currentUserId.toString() != id) {
      return res.sendStatus(403);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(403);
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["USER-AUTH"];

    if (!sessionToken) {
      console.log("session token tidak ada");
      res.sendStatus(400);
    }

    const existingUser = await getUserBySessionToken(sessionToken);

    if (!existingUser) {
      console.log("user tidak tersedia");
      return res.sendStatus(403);
    }

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
