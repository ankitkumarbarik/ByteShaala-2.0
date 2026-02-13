import Lecture from "../models/lecture.model.js";
import Section from "../models/section.model.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import ApiError from "../utils/ApiError.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../services/cloudinary.service.js";

export const addLecture = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const { title, order, videoUrl, isPreviewFree } = req.body;

    const section = await Section.findById(sectionId);
    if (!section) throw new ApiError(404, "section not found");

    let finalVideoUrl = "";
    let videoPublicId = null;

    if (videoUrl?.trim()) {
        finalVideoUrl = videoUrl;
    } else if (req.file?.buffer) {
        const up = await uploadOnCloudinary(req.file.buffer);
        if (!up?.secure_url) throw new ApiError(500, "video upload failed");
        finalVideoUrl = up.secure_url;
        videoPublicId = up.public_id;
    } else {
        throw new ApiError(400, "video file or url is required");
    }

    const lecture = await Lecture.create({
        courseId: section.courseId,
        sectionId,
        title: title.trim(),
        order: order || 1,
        videoUrl: finalVideoUrl,
        videoPublicId,
        isPreviewFree: Boolean(isPreviewFree),
    });

    return res.status(201).json(new ApiResponse(201, lecture, "lecture added"));
});

export const getLecturesBySection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;

    const lectures = await Lecture.find({ sectionId }).sort({ order: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, lectures, "lectures fetched"));
});

export const updateLecture = asyncHandler(async (req, res) => {
    const { sectionId, lectureId } = req.params;
    const { title, order, videoUrl, isPreviewFree } = req.body;

    const lecture = await Lecture.findOne({ _id: lectureId, sectionId });
    if (!lecture) throw new ApiError(404, "lecture not found");

    if (title) lecture.title = title.trim();
    if (order) lecture.order = order;
    if (typeof isPreviewFree !== "undefined")
        lecture.isPreviewFree = Boolean(isPreviewFree);

    if (videoUrl?.trim()) {
        if (lecture.videoPublicId)
            await deleteFromCloudinary(lecture.videoPublicId, "video");
        lecture.videoUrl = videoUrl;
        lecture.videoPublicId = null;
    } else if (req.file?.buffer) {
        if (lecture.videoPublicId)
            await deleteFromCloudinary(lecture.videoPublicId, "video");
        const up = await uploadOnCloudinary(req.file.buffer);
        if (!up?.secure_url) throw new ApiError(500, "video upload failed");
        lecture.videoUrl = up.secure_url;
        lecture.videoPublicId = up.public_id;
    }

    await lecture.save();

    return res
        .status(200)
        .json(new ApiResponse(200, lecture, "lecture updated"));
});

export const deleteLecture = asyncHandler(async (req, res) => {
    const { sectionId, lectureId } = req.params;

    const lecture = await Lecture.findOne({ _id: lectureId, sectionId });
    if (!lecture) throw new ApiError(404, "lecture not found");

    if (lecture.videoPublicId)
        await deleteFromCloudinary(lecture.videoPublicId, "video");
    await lecture.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "lecture deleted"));
});
