import Singer from "../../models/singer.model";
import FavoriteSong from "../../models/favorite-song.model";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";

export const list = async (req: Request, res: Response) => {
    const topic = await Topic.findOne({
      slug: req.params.slugTopic,
      status: "active",
      deleted: false
    });

    const songs = await Song.find({
       topicId: topic.id,
       status: "active",
      deleted: false
       
    }).select(" avatar title slug singerId like ");

    for(const song of songs){
        const infoSinger = await Singer.findOne({
           _id: song.id,
            status: "active",
            deleted: false
        });

        song["infoSinger"] = infoSinger;
    }

    res.render("client/pages/songs/list", {
      pageTitle: topic.title,
      songs: songs
    });
};

export const detail = async (req : Request, res : Response) => {
    const slugSong : string | string[] = req.params.slugSong;
    
    const song = await Song.findOne({
        slug: slugSong,
        status: "active",
        deleted: false
    });

    const singer = await Singer.findOne({
       _id: song.singerId,
       deleted: false
    }).select("fullName");

    const topic = await Topic.findOne({
       _id: song.topicId,
       deleted: false
    }).select("title");

    const favoriteSong = await FavoriteSong.findOne({
        songId = idSong,

    });

    song["isFavoriteSong"] = favoriteSong ? true : false;

    res.render("client/pages/songs/detail", {
      pageTitle: "Chi tiết bài hát",
      song: song,
      singer: singer
    });
};

export const like = async (req : Request, res : Response) => {
   const idSong : string | string[] = req.params.idSong;
   const typeLike : string | string[] = req.params.typeLike;

   const song = await Song.find({
    _id: idSong,
    status: "active",
    deleted: false
   });
   
   const newLike : number = typeLike == "like" ? song.like + 1 : song.like - 1;
   await Song.updateOne({
     _id: idSong
   },{
    like: newLike
   });
   res.json({
    code:200,
    message:"Thành công",
    like: newLike
   });
};

export const favorite = async (req : Request, res : Response) => {
   const idSong : string | string[] = req.params.idSong;
   const typeFavorite : string | string[] = req.params.typeFavorite;

   switch (typeFavorite) {
    case "favorite":
        const exitsFavoriteSong = await FavoriteSong.findOne({
            songId: idSong,
        });
        if(!exitsFavoriteSong){
            const record = new FavoriteSong({
                userId: "",
                songId: idSong,
            });
            await record.save();
        }
        break;
    case "unfavorite":
        await FavoriteSong.deleteOne({
            songId: idSong,
        });
        
        break;
    default:
        break;
   }

   res.json({
    code:200,
    message:"Thành công",

   });
};