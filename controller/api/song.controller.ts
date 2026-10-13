import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import Song from "../../models/song.model";

const audioBucket = (): mongoose.mongo.GridFSBucket => {
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error("MongoDB connection is not ready");
    }

    return new mongoose.mongo.GridFSBucket(db, { bucketName: "audio" });
};

const textField = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";

const makeSlug = (title: string): string =>
    title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

export const create = async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    const title = textField(req.body.title);

    if (!file) {
        res.status(400).json({
            code: 400,
            message: "Upload an MP3 file using the audio field",
        });
        return;
    }

    if (!title) {
        res.status(400).json({
            code: 400,
            message: "The title field is required",
        });
        return;
    }

    const songId = new mongoose.Types.ObjectId();
    const bucket = audioBucket();
    const uploadStream = bucket.openUploadStreamWithId(
        songId,
        `${songId.toString()}.mp3`,
        { metadata: { contentType: "audio/mpeg" } },
    );

    try {
        await pipeline(Readable.from([file.buffer]), uploadStream);

        const song = new Song({
            _id: songId,
            title,
            avatar: textField(req.body.avatar),
            description: textField(req.body.description),
            singerId: textField(req.body.singerId),
            topicId: textField(req.body.topicId),
            like: 0,
            lyrics: textField(req.body.lyrics),
            audio: `/api/songs/${songId.toString()}/audio`,
            audioFileId: songId.toString(),
            status: "active",
            slug: makeSlug(title) || songId.toString(),
            deleted: false,
        });

        await song.save();

        res.status(201).json({
            code: 201,
            message: "Song uploaded successfully",
            data: {
                id: song.id,
                title: song.title,
                slug: song.slug,
                audio: song.audio,
            },
        });
    } catch (error) {
        try {
            await bucket.delete(songId);
        } catch (cleanupError) {
            console.error("Unable to clean up uploaded audio", cleanupError);
        }

        throw error;
    }
};

export const streamAudio = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const songId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid song ID",
        });
        return;
    }

    const song = await Song.findById(songId).select("audioFileId");

    if (!song || !song.audioFileId || !mongoose.Types.ObjectId.isValid(song.audioFileId)) {
        res.status(404).json({
            code: 404,
            message: "Audio not found",
        });
        return;
    }

    const bucket = audioBucket();
    const fileId = new mongoose.Types.ObjectId(song.audioFileId);
    const file = await bucket.find({ _id: fileId }).next();

    if (!file) {
        res.status(404).json({
            code: 404,
            message: "Audio not found",
        });
        return;
    }

    res.setHeader("Content-Type", file.metadata?.contentType || "audio/mpeg");
    res.setHeader("Content-Length", file.length);
    res.setHeader("Content-Disposition", "inline");

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", next);
    downloadStream.pipe(res);
};
