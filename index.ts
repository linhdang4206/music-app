import express, { Express } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";

import clientRoutes from "./routes/client/index.route";
import apiSongRoutes from "./routes/api/song.route";

dotenv.config();

const app : Express = express();
const port: number | string = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

clientRoutes(app);
app.use("/api/songs", apiSongRoutes);

const startServer = async (): Promise<void> => {
    try {
        await database.connect();
        app.listen(port, () => {
            console.log(`app listening on port ${port}`);
        });
    } catch (error) {
        console.error("Unable to start server", error);
        process.exitCode = 1;
    }
};

void startServer();