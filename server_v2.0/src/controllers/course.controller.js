import asyncHandler from "../utils/asyncHandler.util.js";
import ApiError from "../utils/ApiError.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import slugify from "slugify";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../services/cloudinary.service.js";
import Course from "../models/course.model.js";
import axios from "axios";
import dotenv from "dotenv";
import { createCourseSchema } from "../validations/course.validation.js";
import Lecture from "../models/lecture.model.js";
import Section from "../models/section.model.js";
import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";
import User from "../models/user.model.js";

dotenv.config();

export const createCourse = asyncHandler(async (req, res) => {
    if (!req.body.payloadObj) {
        throw new ApiError(400, "payloadObj is required");
    }

    let payloadObj;
    try {
        payloadObj = JSON.parse(req.body.payloadObj);
    } catch {
        throw new ApiError(400, "invalid payload format");
    }

    const { error, value } = createCourseSchema.validate(payloadObj, {
        abortEarly: false,
    });

    if (error) {
        throw new ApiError(400, error.details.map((e) => e.message).join(", "));
    }

    // destructure ONLY validated data
    const {
        title,
        description,
        category,
        price,
        originalPrice,
        currency,
        language,
        level,
        tags,
        duration,
        averageRating,
        requirements,
        learningPoints,
        courseContent,
        thumbnailUrl,
    } = payloadObj;

    const slug = slugify(title.trim(), { lower: true, strict: true });

    const existedCourse = await Course.findOne({ slug });
    if (existedCourse)
        throw new ApiError(409, "course with this slug already exists");

    let thumbnailLocalPath = req.file?.buffer;
    let thumbnailImage = null;
    let thumbnail = "";
    let thumbnailPublicId = "";

    if (thumbnailUrl) {
        thumbnail = thumbnailUrl;
        thumbnailPublicId = null;
    } else if (thumbnailLocalPath) {
        thumbnailImage = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnailImage?.secure_url)
            throw new ApiError(500, "error while uploading thumbnail");
        thumbnail = thumbnailImage.secure_url;
        thumbnailPublicId = thumbnailImage.public_id;
    } else {
        throw new ApiError(400, "thumbnail file or url is required");
    }

    const course = new Course({
        title: title?.trim(),
        description: description?.trim(),
        category: category?.trim(),
        slug,
        price,
        originalPrice,
        currency,
        language,
        level,
        duration,
        averageRating: averageRating || 0,
        requirements: requirements || [],
        learningPoints: learningPoints || [],
        courseContent: courseContent || [],
        tags: tags || [],
        thumbnail,
        thumbnailPublicId, // store Cloudinary id for future deletion
        instructor: req.user?._id,
    });

    const createdCourse = await course.save();
    if (!createdCourse)
        throw new ApiError(500, "course creation failed, please try again");

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdCourse, "course created successfully"),
        );
});

export const updateCourse = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const payloadObj = JSON.parse(req.body.payloadObj || "{}");

    const {
        title,
        description,
        category,
        price,
        originalPrice,
        currency,
        language,
        level,
        tags,
        duration,
        averageRating,
        requirements,
        learningPoints,
        courseContent,
        thumbnailUrl, // support direct URL
    } = payloadObj;

    const existedCourse = await Course.findOne({ slug });
    if (!existedCourse) throw new ApiError(404, "course not found");

    const updateFields = {};

    // Title change => slug change
    if (title && title.trim() !== existedCourse.title) {
        const newSlug = slugify(title.trim(), { lower: true, strict: true });
        const slugExists = await Course.findOne({
            slug: newSlug,
            _id: { $ne: existedCourse._id },
        });
        if (slugExists)
            throw new ApiError(409, "course with this slug already exists");

        updateFields.title = title.trim();
        updateFields.slug = newSlug;
    }

    // Update other fields
    if (description) updateFields.description = description.trim();
    if (category) updateFields.category = category.trim();
    if (price !== undefined) updateFields.price = price;
    if (originalPrice !== undefined) updateFields.originalPrice = originalPrice;
    if (currency) updateFields.currency = currency.trim();
    if (language) updateFields.language = language.trim();
    if (level) updateFields.level = level;
    if (tags) updateFields.tags = tags;
    if (duration) updateFields.duration = duration;
    if (averageRating !== undefined) updateFields.averageRating = averageRating;
    if (requirements) updateFields.requirements = requirements;
    if (learningPoints) updateFields.learningPoints = learningPoints;
    if (courseContent) updateFields.courseContent = courseContent;

    // Thumbnail Update Logic
    if (req.file?.buffer || thumbnailUrl) {
        // Purana thumbnail delete karo agar Cloudinary ka hai
        if (existedCourse.thumbnailPublicId) {
            await deleteFromCloudinary(
                existedCourse.thumbnailPublicId,
                "image",
            );
        }

        if (req.file?.buffer) {
            const newThumbnail = await uploadOnCloudinary(req.file.buffer);
            if (!newThumbnail?.secure_url)
                throw new ApiError(500, "error while uploading thumbnail");
            updateFields.thumbnail = newThumbnail.secure_url;
            updateFields.thumbnailPublicId = newThumbnail.public_id;
        } else if (thumbnailUrl) {
            updateFields.thumbnail = thumbnailUrl;
            updateFields.thumbnailPublicId = null; // direct URL ka Cloudinary ID nahi hota
        }
    }

    const updatedCourse = await Course.findOneAndUpdate(
        { slug },
        { $set: updateFields },
        { new: true, runValidators: true },
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedCourse, "course updated successfully"),
        );
});

export const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Course not found");

    if (course.thumbnailPublicId) {
        await deleteFromCloudinary(course.thumbnailPublicId, "image");
    }

    const sections = await Section.find({ courseId });
    for (const s of sections) {
        const lectures = await Lecture.find({ sectionId: s._id });
        for (const l of lectures) {
            if (l.videoPublicId)
                await deleteFromCloudinary(l.videoPublicId, "video");
        }
        await Lecture.deleteMany({ sectionId: s._id });
    }
    await Section.deleteMany({ courseId });
    await Course.findByIdAndDelete(courseId);

    await axios.patch(
        `${process.env.APP_SERVICE}/api/v1/user/remove-enrolled-course`,
        { courseId },
        { headers: { Authorization: req.header("Authorization") } },
    );

    await axios.patch(
        `${process.env.APP_SERVICE}/api/v1/cart/remove-course`,
        { courseId },
        { headers: { Authorization: req.header("Authorization") } },
    );

    return res.status(200).json(new ApiResponse(200, {}, "course deleted"));
});

export const getAllCourses = asyncHandler(async (req, res) => {
    const { search } = req.query;

    // Build search filter
    let searchFilter = {};
    if (search && search.trim()) {
        searchFilter.title = {
            $regex: search.trim(),
            $options: "i", // Case-insensitive search
        };
    }

    const existedCourse = await Course.find(searchFilter).sort("-createdAt");
    if (!existedCourse) {
        throw new ApiError(404, "course not found");
    }

    // Check if user is authenticated and get enrollment status
    const authHeader = req.header("Authorization");

    let userEnrolledCourses = [];
    console.log("Authorization header:", authHeader ? "Present" : "Missing");

    if (authHeader) {
        try {
            const { data } = await axios.get(
                `${process.env.APP_SERVICE}/api/v1/user/current-user`,
                {
                    headers: {
                        Authorization: authHeader,
                    },
                },
            );
            // Get the user's enrolled courses array
            userEnrolledCourses = data?.data?.enrolledCourses || [];
            console.log("User enrolled courses:", userEnrolledCourses);
        } catch (error) {
            // User not authenticated, continue without enrollment status
            console.log("Error fetching user data:", error.message);
        }
    }

    // Add enrollment status to each course
    const coursesWithEnrollment = existedCourse.map((course) => {
        const courseObj = course.toObject();
        // Check if course ID exists in user's enrolledCourses array
        if (userEnrolledCourses.length > 0) {
            const isEnrolled = userEnrolledCourses.some((enrolledCourse) => {
                // Handle both string IDs and course objects
                const enrolledCourseId =
                    typeof enrolledCourse === "string"
                        ? enrolledCourse
                        : enrolledCourse._id || enrolledCourse;
                return enrolledCourseId.toString() === course._id.toString();
            });
            courseObj.isEnrolled = isEnrolled;
        } else {
            courseObj.isEnrolled = false;
        }
        return courseObj;
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                coursesWithEnrollment,
                "courses fetched successfully",
            ),
        );
});

export const getCourseById = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const existedCourse = await Course.findOne({ slug });

    if (!existedCourse) {
        throw new ApiError(404, "course not found");
    }

    const clonedCourse = JSON.parse(JSON.stringify(existedCourse));

    if (clonedCourse?.reviews?.length) {
        try {
            for (let i = 0; i < clonedCourse.reviews.length; i++) {
                try {
                    const userResponse = await axios.get(
                        `${process.env.APP_SERVICE}/get-user/${clonedCourse.reviews[i].user}`,
                    );

                    // Add user data to the review object
                    clonedCourse.reviews[i].userData = userResponse.data.data;
                } catch (userError) {
                    // Keep the review but without user data
                    clonedCourse.reviews[i].userData = null;
                }
            }
        } catch (error) {
            console.error("Error processing reviews:", error.message);
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, clonedCourse, "course fetched successfully"),
        );
});

export const getCourseCurriculum = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "course not found");

    let isAdmin = false;
    let isEnrolled = false;

    const authHeader = req.header("Authorization");

    if (authHeader) {
        try {
            const token = authHeader.replace("Bearer ", "");
            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET,
            );

            const authUser = await Auth.findById(decodedToken._id);
            if (authUser) {
                isAdmin = authUser.role === "ADMIN";

                // Check enrollment if not admin
                if (!isAdmin) {
                    const user = await User.findOne({ userId: authUser._id });
                    if (user && user.enrolledCourses?.length) {
                        // Handle both string IDs and object IDs in enrolledCourses
                        isEnrolled = user.enrolledCourses.some((c) => {
                            const cId =
                                typeof c === "string"
                                    ? c
                                    : c._id?.toString() || c.toString();
                            return cId === courseId;
                        });
                    }
                }
            }
        } catch (err) {
            console.log(
                "Error verifying auth in getCourseCurriculum:",
                err.message,
            );
            isAdmin = false;
            isEnrolled = false;
        }
    }

    const sections = await Section.find({ courseId }).sort({ order: 1 });

    // 5. build curriculum
    const curriculum = [];

    for (const section of sections) {
        const lectures = await Lecture.find({
            sectionId: section._id,
            isPublished: true,
        }).sort({ order: 1 });

        let filteredLectures = lectures;

        if (!isAdmin && !isEnrolled) {
            filteredLectures = lectures.filter((l) => l.isPreviewFree === true);
        }

        curriculum.push({
            _id: section._id,
            title: section.title,
            order: section.order,
            lectures: filteredLectures,
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, curriculum, "course curriculum fetched"));
});

export const getCourseByObjectId = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const existedCourse = await Course.findById(courseId);
    if (!existedCourse) {
        throw new ApiError(404, "course not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, existedCourse, "course fetched successfully"),
        );
});

export const addReviews = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    const existedCourse = await Course.findById(courseId);
    if (!existedCourse) {
        throw new ApiError(404, "course not found");
    }

    // check if user already reviewed
    const alreadyReviewed = existedCourse.reviews.some(
        (item) => item.user.toString() === req.user?._id.toString(),
    );
    if (alreadyReviewed) {
        throw new ApiError(400, "you already reviewed this course");
    }

    const review = {
        user: req.user?._id,
        rating: Number(rating),
        comment,
    };

    // push review
    existedCourse.reviews.push(review);

    // calculate average rating
    existedCourse.averageRating = Number(
        (
            existedCourse.reviews.reduce((acc, item) => item.rating + acc, 0) /
            existedCourse.reviews.length
        ).toFixed(1),
    );

    await existedCourse.save();

    return res
        .status(200)
        .json(new ApiResponse(200, existedCourse, "review added successfully"));
});

export const getAllReviews = asyncHandler(async (req, res) => {
    const existedCourse = await Course.find().select("reviews");

    const allReviews = existedCourse.flatMap((course) =>
        course.reviews.map((review) => ({
            course: course._id,
            user: review.user,
            rating: review.rating,
            comment: review.comment,
        })),
    );

    // Fetch user data for each review
    for (let i = 0; i < allReviews.length; i++) {
        try {
            const userResponse = await axios.get(
                `${process.env.APP_SERVICE}/get-user/${allReviews[i].user}`,
            );
            // Add user data to the review object
            allReviews[i].userData = userResponse.data.data;
        } catch (userError) {
            console.error(
                `Error fetching user data for review ${allReviews[i].user}:`,
                userError.message,
            );
            // Keep the review but without user data
            allReviews[i].userData = null;
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allReviews, "reviews fetched successfully"));
});
