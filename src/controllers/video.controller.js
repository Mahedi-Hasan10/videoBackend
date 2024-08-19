import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Comment } from "../models/comments.model.js";

const getVideos = asyncHandler(async (req, res) => {
  const video = await Video.find();
  if (!video) {
    throw new ApiError(400, "No videos found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "All videos fethced successfully"));
});

const getVideo = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new ApiError(400, "No video id found");
  }
  const videoWithComments = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id), // Match the video by ID
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
          {
            $project: {
              _id: 1,
              comment: 1,
              owner: {
                _id: 1,
                fullName: 1,
                email: 1,
              },
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!videoWithComments) {
    throw new ApiError(400, "No video found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoWithComments, "Video fethced successfully")
    );
});

const createVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  const user = await User.findById(req?.user?._id);
  if (!title || !description || !isPublished)
    throw new ApiError(400, "All fields are required");
  if (!user) throw new ApiError(400, "Unauthorized request");

  const videoLocalpath = req.files["videoFile"][0];
  const thumbnailLocalPath = req.files["thumbnail"][0];

  if (!videoLocalpath) throw new ApiError(400, "No video file found");
  if (!thumbnailLocalPath) throw new ApiError(400, "No thumbnail file found");

  const videoFile = await uploadOnCloudinary(videoLocalpath?.path);
  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath?.path);
  if (!videoFile || !thumbnailFile)
    throw new ApiError(
      400,
      "Something went wrong while uploading on cloudinary"
    );

  const video = await Video.create({
    videoFile: videoFile.secure_url,
    thumbnail: thumbnailFile.secure_url,
    title,
    description,
    isPublished,
    duration: videoFile?.duration,
    owner: user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video created successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  if (!req?.user?._id) throw new ApiError(400, "Unauthorized request");
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) throw new ApiError(400, "Video not found!");

  const user = await User.findById(req?.user?._id);
  if (!user) throw new ApiError(400, "Unauthorized request");
  if (video?.owner.toString() !== user?._id.toString()) {
    throw new ApiError(400, "You don't have permission to delete this video");
  }
  await Video.findByIdAndDelete(video?._id);
  return res
    .status(200)
    .json(new ApiResponse(200, "Video Deleted Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoLocalpath = req.files["videoFile"][0];
  const thumbnailLocalPath = req.files["thumbnail"][0];
  if (!req?.user?._id) throw new ApiError(400, "Unauthorized request");

  const { id } = req.params;
  const video1 = await Video.findById(id);
  if (!video1) throw new ApiError(400, "Video not found!");
  let videoFile, thumbnailFile;
  if (videoLocalpath) {
    videoFile = await uploadOnCloudinary(videoLocalpath?.path);
  }
  if (thumbnailLocalPath) {
    thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath?.path);
  }
  if (!videoFile || !thumbnailFile)
    throw new ApiError(
      400,
      "Something went wrong while uploading on cloudinary"
    );

  const video = await Video.findByIdAndUpdate(
    id,
    {
      $set: {
        title,
        description,
        videoFile: videoFile.secure_url,
        thumbnail: thumbnailFile.secure_url,
      },
    },
    {
      new: true,
    }
  );
  if (!video) throw new ApiError(400, "Error in updating video");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully"));
});
const postComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  console.log("🚀 ~ postComment ~ comment:", comment);

  if (!req?.user?._id) throw new ApiError(400, "Unauthorized request");
  if (!comment) throw new ApiError(400, "Comment is required");
  const { id } = req.params;

  const comments = await Comment.create({
    comment,
    owner: req?.user?._id,
    video: id,
  });
  if (!comments) throw new ApiError(400, "Error in creating comment");

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comment Updated Successfully"));
});

export {
  getVideos,
  getVideo,
  createVideo,
  deleteVideo,
  updateVideo,
  postComment,
};
