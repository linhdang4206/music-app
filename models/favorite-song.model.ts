import mongoose from "mongoose";

const favoriteSongSchema = new mongoose.Schema({
    userId: String,
    songId: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,


}, {
    timestamps: true,
});

const FavoriteSong = mongoose.model('FavoriteSong', favoriteSongSchema, "favoriteSongs");

export default FavoriteSong;