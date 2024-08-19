import { Router } from "express";
import {
  createVideo,
  deleteVideo,
  getVideo,
  getVideos,
  postComment,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(getVideos)
  .post(
    verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 }, // Handle video file upload
      { name: "thumbnail", maxCount: 1 }, // Handle thumbnail upload
    ]),
    createVideo
  );
router
  .route("/:id")
  .get(verifyJWT, getVideo)
  .delete(verifyJWT, deleteVideo)
  .patch(
    verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 }, // Handle video file upload
      { name: "thumbnail", maxCount: 1 }, // Handle thumbnail upload
    ]),
    updateVideo
  );

router.route("/comment/:id").post(verifyJWT, postComment);
export default router;
