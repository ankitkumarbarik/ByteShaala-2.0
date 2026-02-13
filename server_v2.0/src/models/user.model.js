import { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      unique: true,
      index: true,
      ref: "Auth",
    },
    firstName: {
      type: String,
      required: [true, "firstname is required"],
      trim: true,
      index: true,
    },
    lastName: {
      type: String,
      required: [true, "lastname is required"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
    },
    avatarPublicId: {
      type: String,
      trim: true,
    },
    // User Type - Step 2
    userType: {
      type: String,
      enum: ["STUDENT", "PROFESSIONAL"],
      required: [true, "user type is required"],
      default: "STUDENT",
    },
    // Academic Details - Step 3A (for STUDENT type)
    academicDetails: {
      university: {
        type: String,
        trim: true,
      },
      department: {
        type: String,
        enum: [
          "Computer Science & IT",
          "Business Administration",
          "Commerce",
          "Arts & Humanities",
          "Science",
          "Other",
        ],
      },
      program: {
        type: String,
        trim: true,
      },
      currentSemester: {
        type: String,
        enum: [
          "Sem-1",
          "Sem-2",
          "Sem-3",
          "Sem-4",
          "Sem-5",
          "Sem-6",
          "Sem-7",
          "Sem-8",
        ],
      },
      enrollmentNumber: {
        type: String,
        trim: true,
      },
    },
    // Interests - Step 3B (optional)
    interests: {
      type: [String],
      default: [],
    },
    // Enrolled Courses
    enrolledCourses: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
