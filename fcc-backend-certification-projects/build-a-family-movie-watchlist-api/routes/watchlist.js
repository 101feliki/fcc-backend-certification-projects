import express from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../utils/db.js";

const router = express.Router();

router.use(authenticate);

router.get("/:userId", async (req, res) => {
  const watchlist = await getWatchlist(Number(req.params.userId));
  if (!watchlist) {
    return res.status(404).json({ error: "Watchlist not found." });
  }
  res.status(200).json(watchlist);
});

router.post("/:userId/movies", authorizeModification, async (req, res) => {
  const movie = await addMovie(Number(req.params.userId), req.body ?? {});
  res.status(201).json(movie);
});

router.put(
  "/:userId/movies/:movieId",
  authorizeModification,
  async (req, res) => {
    const movie = await updateMovie(
      Number(req.params.userId),
      Number(req.params.movieId),
      req.body ?? {}
    );
    if (movie === null || movie === false) {
      return res.status(404).json({ error: "Movie not found." });
    }
    res.status(200).json(movie);
  }
);

router.delete(
  "/:userId/movies/:movieId",
  authorizeModification,
  async (req, res) => {
    const result = await deleteMovie(
      Number(req.params.userId),
      Number(req.params.movieId)
    );
    if (result === null || result === false) {
      return res.status(404).json({ error: "Movie not found." });
    }
    res.status(200).json({ message: "Movie removed." });
  }
);

export default router;
