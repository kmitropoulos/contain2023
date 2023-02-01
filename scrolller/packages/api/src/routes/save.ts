import { authMiddleware } from "@/middlewares/auth-middleware";
import type {
  SaveFeedRequest,
  SaveFeedResponse,
  SaveRequest,
  SaveResponse,
} from "@/types";
import { saveMessages } from "@/util/constants";
import { HttpError } from "@/util/http-error";
import { HttpStatus } from "@/util/http-status";
import { validateSaveInput } from "@/util/validators";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get(
  "/",
  authMiddleware,
  async (req: SaveFeedRequest, res: SaveFeedResponse) => {
    const userId = req.user!.id;
    const postId = req.query.after as string;

    let cursor = {};
    if (postId) cursor = { cursor: { userId_postId: { userId, postId } } };

    const results = await prisma.save.findMany({
      where: { userId: req.user!.id },
      include: {
        post: true,
      },
      ...cursor,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(HttpStatus.OK).json({
      ok: true,
      posts: results.map((r:any) => ({
        id: r.post.id,
        title: r.post.title,
        sub: r.post.sub,
        url: r.post.url,
        saved: true,
      })),
      hasMore: false,
    });
  }
);

router.post(
  "/",
  authMiddleware,
  async (req: SaveRequest, res: SaveResponse, next: NextFunction) => {
    const input = req.body;
    const userId = req.user!.id;
    const postId = input.id;

    let message = validateSaveInput(input);
    if (message) return next(new HttpError(HttpStatus.BAD_REQUEST, message));

    const saved = await prisma.save.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (saved) {
      await prisma.save.delete({
        where: { userId_postId: { userId, postId } },
      });
      message = saveMessages.UNSAVE_SUCCESS;
    } else {
      let post = await prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post) post = await prisma.post.create({ data: { ...input } });
      await prisma.save.create({ data: { userId, postId: input.id } });
      message = saveMessages.SAVE_SUCCESS;
    }
    return res.status(HttpStatus.CREATED).json({ ok: true, message });
  }
);

export default router;
