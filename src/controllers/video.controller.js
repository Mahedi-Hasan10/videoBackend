import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getVideos = asyncHandler(async (req, res) => {
    const video = await Video.find();  
    if(!video)
    {
        throw new ApiError(400, "No videos found");
    }
    return res.status(200)
    .json(new ApiResponse(200,video,"All videos fethced successfully"))
})

const getVideo = asyncHandler(async (req, res) => {
    const id = req.params.id
    if(!id){
        throw new ApiError(400, "No video id found");
    }
    const video = await Video.findById(id);
    if(!video)
    {
        throw new ApiError(400, "No video found");
    }
    return res.status(200)
    .json(new ApiResponse(200,video,"Video fethced successfully"))
})

const createVideo = asyncHandler(async (req, res) => {
    const {title, description, isPublished} = req.body
    if(!title || !description || !isPublished) throw new ApiError(400, "All fields are required");

    const videoLocalpath = req.file.path
    const thumbnailLocalPath = req.file.path

    if(!videoLocalpath) throw new ApiError(400, "No video file found");
    if(!thumbnailLocalPath) throw new ApiError(400, "No thumbnail file found");

    const videoFile = await uploadOnCloudinary(videoLocalpath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
    if(!videoFile || !thumbnailFile) throw new ApiError(400, "Something went wrong while uploading on cloudinary");

    const video = await Video.create({
        videoFile: videoFile.secure_url,
        thumbnail: thumbnailFile.secure_url,
        title,
        description,
        isPublished
    })
    return res.status(200)
    .json(new ApiResponse(200,video,"Video created successfully"))
})


export { getVideos,getVideo ,createVideo}