import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import * as controller from "../../controller/api/song.controller";

const router: Router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (_req, file, callback) => {
        const isMp3 = file.mimetype === "audio/mpeg" && /\.mp3$/i.test(file.originalname);

        if (!isMp3) {
            callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "audio"));
            return;
        }

        callback(null, true);
    },
});

router.post("/", upload.single("audio"), controller.create);
router.get("/:id/audio", controller.streamAudio);

router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof multer.MulterError) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        res.status(status).json({
            code: status,
            message: error.code === "LIMIT_FILE_SIZE"
                ? "File size must not exceed 20 MB"
                : "Upload one MP3 file using the audio field",
        });
        return;
    }

    console.error("Song API error", error);
    res.status(500).json({
        code: 500,
        message: "Internal server error",
    });
});

export default router;
