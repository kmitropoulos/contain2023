import { authMiddleware } from "@/middlewares/auth-middleware";
import type {
  UpdatePasswordRequest,
  UpdateResponse,
  UpdateUserRequest,
} from "@/types";
import { passwordMessages, userMessages } from "@/util/constants";
import { HttpError } from "@/util/http-error";
import { HttpStatus } from "@/util/http-status";
import { validatePasswordInput, validateUserInput } from "../util/validators";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { NextFunction, Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.put(
  "/user",
  authMiddleware,
  async (req: UpdateUserRequest, res: UpdateResponse, next: NextFunction) => {
    const input = req.body;

    const message = validateUserInput(input);
    if (message) return next(new HttpError(HttpStatus.BAD_REQUEST, message));

    let user = await prisma.user.findUnique({
      where: { username: input.username },
    });
    if (user && user.id != req.user!.id)
      return next(
        new HttpError(HttpStatus.BAD_REQUEST, userMessages.USERNAME_TAKEN)
      );

    user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { username: input.username, name: input.name ?? "" },
    });

    req.session!.username = user.username;
    return res
      .status(HttpStatus.OK)
      .json({ ok: true, message: userMessages.UPDATE_SUCCESS });
  }
);

router.put(
  "/password",
  authMiddleware,
  async (
    req: UpdatePasswordRequest,
    res: UpdateResponse,
    next: NextFunction
  ) => {
    const input = req.body;

    const message = validatePasswordInput(input);
    if (message) return next(new HttpError(HttpStatus.BAD_REQUEST, message));

    const valid = await compare(input.oldPassword, req.user!.password);
    if (!valid)
      return next(
        new HttpError(
          HttpStatus.BAD_REQUEST,
          passwordMessages.INCORRECT_PASSWORD
        )
      );

    const password = await hash(input.password, 10);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password },
    });
    return res
      .status(HttpStatus.OK)
      .json({ ok: true, message: passwordMessages.UPDATE_SUCCESS });
  }
);

export default router;
