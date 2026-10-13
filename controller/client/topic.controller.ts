import { Request, Response } from "express";

import Topic from "../../models/topic.model";

export const topics = async (req: Request, res: Response) => {
    const topics = await Topic.find({
        deleted: false,
    })
    res.render("client/pages/topics/index", {
      pageTitle: "Chủ đè bài hát",
      topics: topics
    });
};