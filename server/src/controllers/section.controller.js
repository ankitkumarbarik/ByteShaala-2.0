import asyncHandler from "../utils/asyncHandler.util.js";
import ApiError from "../utils/ApiError.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import Course from "../models/course.model.js";
import Section from "../models/section.model.js";
import Lecture from "../models/lecture.model.js";
import { deleteFromCloudinary } from "../services/cloudinary.service.js";

export const createSection = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, order } = req.body;

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "course not found");

  const section = await Section.create({
    courseId,
    title: title.trim(),
    description: description?.trim() || "",
    order: order || 1,
  });

  return res.status(201).json(new ApiResponse(201, section, "section created"));
});

export const getSectionsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const sections = await Section.find({ courseId }).sort({ order: 1 });

  // Fetch lectures for each section
  const sectionsWithLectures = await Promise.all(
    sections.map(async (section) => {
      const lectures = await Lecture.find({ sectionId: section._id }).sort({
        order: 1,
      });
      return {
        ...section.toObject(),
        lectures,
        lecturesCount: lectures.length,
      };
    }),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, sectionsWithLectures, "sections fetched"));
});

export const deleteSection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;

  const section = await Section.findById(sectionId);
  if (!section) throw new ApiError(404, "section not found");

  const lectures = await Lecture.find({ sectionId });
  if (!lectures) throw new ApiError(404, "lectures not found");

  for (const l of lectures) {
    if (l.videoPublicId) {
      await deleteFromCloudinary(l.videoPublicId, "video");
    }
  }

  await Lecture.deleteMany({ sectionId });
  await Section.findByIdAndDelete(sectionId);

  return res.status(200).json(new ApiResponse(200, {}, "section deleted"));
});
