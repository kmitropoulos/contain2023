import type { FeedPost, FeedResponse } from "@/types";
import { RedditSubResponse } from "@/types/reddit";
import { feedMessages } from "@/util/constants";
import { fetchFeed } from "@/util/fetchers";
import { HttpError } from "@/util/http-error";
import { HttpStatus } from "@/util/http-status";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

const mapToPost = (
  redditRes: RedditSubResponse,
  savedPosts: string[]
): FeedPost[] =>
  redditRes.data.children.map((p) => ({
    id: p.data.id,
    title: p.data.title,
    url: p.data.url_overridden_by_dest,
    sub: p.data.subreddit,
    saved: savedPosts.includes(p.data.id),
  }));

router.get("/", async (req, res: FeedResponse) => {
  const redditRes = await fetchFeed(undefined, req.query.after as string);

  let savedIds: string[] = [];
  if (req.session?.username) {
    const postIds = redditRes.data.children.map((post) => post.data.id);
    const user = await prisma.user.findUnique({
      where: { username: req.session.username },
    });
    if (user) {
      const savedPosts = await prisma.save.findMany({
        where: { userId: user.id, postId: { in: postIds } },
        select: { postId: true },
      });
      savedIds = savedPosts.map((p:any) => p.postId);
    }
  }

  return res
    .status(200)
    .json({ ok: true, posts: mapToPost(redditRes, savedIds) });
});

router.get("/:name", async (req, res: FeedResponse, next) => {
  const name = req.params.name;
  if (!name)
    return next(
      new HttpError(HttpStatus.BAD_REQUEST, feedMessages.INVALID_NAME)
    );

  const redditRes = await fetchFeed(name, req.query.after as string);
  if (!redditRes?.data?.children?.length)
    return next(new HttpError(HttpStatus.BAD_REQUEST, feedMessages.NOT_FOUND));

  let savedIds: string[] = [];
  if (req.session?.username) {
    const postIds = redditRes.data.children.map((post) => post.data.id);
    const user = await prisma.user.findUnique({
      where: { username: req.session.username },
    });
    if (user) {
      const savedPosts = await prisma.save.findMany({
        where: { userId: user.id, postId: { in: postIds } },
        select: { postId: true },
      });
      savedIds = savedPosts.map((p:any) => p.postId);
    }
  }

  return res
    .status(200)
    .json({ ok: true, posts: mapToPost(redditRes, savedIds) });
});

export default router;
