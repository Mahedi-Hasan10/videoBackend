import { Router } from "express";
import { createVideo, getVideo, getVideos } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/").get(getVideos)
.post(verifyJWT,
    upload.single("videoFile"),
    upload.single("thumbnail"),
    createVideo)
router.route("/:id").get(getVideo)

export default router;