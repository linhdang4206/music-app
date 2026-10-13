import { Express } from "express";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
imporrt { favoriteSong } from "./"

const clientRoutes = (app : Express): void => {
    // const version = "/test"
    app.get("/", (req, res) => {
        res.redirect("/topics");
    });

    app.use(`/topics`, topicRoutes);
    app.use(`/songs`, songRoutes);
    app.use(`/favorite-songs`, favoriteSongRoutes);
};

export default clientRoutes;