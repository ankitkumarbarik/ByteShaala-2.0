import Auth from "../models/auth.model.js";
import ApiError from "../utils/ApiError.util.js";

export const changePasswordInternal = async ({
    userId,
    oldPassword,
    newPassword,
    confirmPassword,
}) => {
    const existedUser = await Auth.findById(userId);
    if (!existedUser) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await existedUser.comparePassword(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Current password is incorrect");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(
            400,
            "New password cannot be the same as current password",
        );
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(
            400,
            "New password and confirm password do not match",
        );
    }

    const isSameAsCurrentPassword =
        await existedUser.comparePassword(newPassword);

    if (isSameAsCurrentPassword) {
        throw new ApiError(
            400,
            "New password cannot be the same as current password",
        );
    }

    existedUser.password = newPassword;
    await existedUser.save();

    return true;
};
