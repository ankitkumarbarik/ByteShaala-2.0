import asyncHandler from "../utils/asyncHandler.util.js";
import ApiError from "../utils/ApiError.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../services/cloudinary.service.js";
import { changePasswordInternal } from "../services/auth.service.js";
import Auth from "../models/auth.model.js";
import User from "../models/user.model.js";
import axios from "axios";
import dotenv from "dotenv";
import serverConfig from "../config/server.config.js";

dotenv.config();

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(
            400,
            "All fields (oldPassword, newPassword, confirmPassword) are required",
        );
    }

    if (newPassword.length < 8) {
        throw new ApiError(
            400,
            "New password must be at least 8 characters long",
        );
    }

    await changePasswordInternal({
        userId: req.user._id,
        oldPassword,
        newPassword,
        confirmPassword,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
    // Parse JSON payload from form-data
    const payloadObj = JSON.parse(req.body.payloadObj || "{}");
    const { firstName, lastName, avatarUrl } = payloadObj;

    let avatarLocalPath = req.file?.buffer;
    const updateFields = {};

    const existedUser = await User.findOne({ userId: req.user?._id });
    if (!existedUser) {
        throw new ApiError(404, "User not found");
    }

    if (avatarLocalPath || avatarUrl) {
        // Pehle purana avatar delete karo (agar hai)
        if (existedUser.avatar && existedUser.avatarPublicId) {
            await deleteFromCloudinary(existedUser.avatarPublicId, "image");
        }

        if (avatarLocalPath) {
            // Upload naya avatar from buffer
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            if (avatar?.secure_url) {
                updateFields.avatar = avatar.secure_url;
                updateFields.avatarPublicId = avatar.public_id;
            }
        } else if (avatarUrl) {
            // Direct URL use karna hai
            updateFields.avatar = avatarUrl;
            updateFields.avatarPublicId = null; // Cloudinary ka nahi h, so null
        }
    }

    // Update other fields
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;

    // Update in DB
    const updatedUser = await User.findOneAndUpdate(
        { userId: req.user?._id },
        { $set: updateFields },
        { new: true },
    );

    if (!updatedUser)
        throw new ApiError(401, "Something went wrong while updating account");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "Account details updated successfully",
            ),
        );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    // ADMIN case
    if (req.user?.role === "ADMIN") {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    ...req.user,
                    enrolledCourses: [],
                },
                "admin user fetched successfully",
            ),
        );
    }

    // USER case
    const getUser = await User.findOne({ userId: req.user._id });
    if (!getUser) throw new ApiError(404, "user not found");

    const userObj = getUser.toObject();

    if (userObj.enrolledCourses?.length) {
        const fullCourses = [];

        for (let course of userObj.enrolledCourses) {
            try {
                const { data } = await axios.get(
                    `${serverConfig.APP_SERVICE}/api/v1/course/get-course-by-id/${course}`,
                );
                fullCourses.push(data.data);
            } catch (err) {
                console.error(`Failed to fetch course ${course}`, err.message);
            }
        }

        userObj.enrolledCourses = fullCourses;
    }

    const user = {
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        avatar: userObj.avatar,
        userId: userObj._id,
        enrolledCourses: userObj.enrolledCourses,
        ...req.user,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, user, "current user fetched successfully"));
});

export const deleteUser = asyncHandler(async (req, res) => {
    const existedUser = await User.findById(req.params.userId);

    if (!existedUser) throw new ApiError(404, "User not found");

    //Agar user ke paas avatarPublicId hai, delete from Cloudinary
    if (existedUser.avatarPublicId) {
        await deleteFromCloudinary(existedUser.avatarPublicId, "image");
    }

    await User.findByIdAndDelete(req.params.userId);

    await Auth.findByIdAndDelete(existedUser.userId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const { search } = req.query;

    // Build search filter
    let searchFilter = {};
    if (search && search.trim()) {
        searchFilter.$or = [
            {
                firstName: {
                    $regex: search.trim(),
                    $options: "i", // Case-insensitive search
                },
            },
            {
                lastName: {
                    $regex: search.trim(),
                    $options: "i", // Case-insensitive search
                },
            },
        ];
    }

    const users = await User.find(searchFilter);
    if (!users) throw new ApiError(404, "users not found");
    const allUsers = JSON.parse(JSON.stringify(users));
    for (let user of allUsers) {
        try {
            const authUser = await axios.get(
                `${serverConfig.APP_SERVICE}/api/v1/auth/get-user/${String(
                    user.userId,
                )}`,
            );
            if (!authUser) throw new ApiError(404, "user not found");
            user["email"] = authUser.data.data.email;
        } catch (error) {
            console.error("Error calling auth service:", error.message);
        }
    }
    return res
        .status(200)
        .json(new ApiResponse(200, allUsers, "all users fetched successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const existedUser = await User.findOne({ userId });
    if (!existedUser) throw new ApiError(404, "user not found");

    return res
        .status(200)
        .json(new ApiResponse(200, existedUser, "user fetched successfully"));
});

export const addPurchaseCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    const existedUser = await User.findOne({ userId: req.user?._id });
    if (!existedUser) throw new ApiError(404, "user not found");

    existedUser.enrolledCourses.push(courseId);
    await existedUser.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "course added to purchase successfully"),
        );
});

export const removeEnrolledCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    if (!courseId) {
        throw new ApiError(400, "courseId is required");
    }

    if (req.user?.role !== "ADMIN") {
        throw new ApiError(403, "Only admin can remove enrolled course");
    }

    await User.updateMany(
        { enrolledCourses: courseId },
        { $pull: { enrolledCourses: courseId } },
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Course removed from all enrolled users"),
        );
});
