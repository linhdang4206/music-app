import { Router } from "express";
const router : Router = Router();

import * as controller from "../../controller/client/favorite-songs.controller"

router.get("/", controller.index);



export const favoriteSongRoutes: Router = router;