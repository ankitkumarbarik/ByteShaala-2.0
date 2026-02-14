import User from "../models/user.model.js";

export const createUserProfile = async ({
    userId,
    firstName,
    lastName,
    userType,
    interests,
    academicDetails,
}) => {
    const user = new User({
        userId,
        firstName,
        lastName,
        userType,
        interests,
        academicDetails,
    });

    await user.save();
};
