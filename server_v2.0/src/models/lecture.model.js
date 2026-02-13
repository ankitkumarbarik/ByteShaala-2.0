import { Schema, Types, model } from "mongoose";

// lecture schema
const lectureSchema = new Schema(
    {
        courseId: {
            type: Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, "lecture title is required"],
            trim: true,
        },
        videoUrl: {
            type: String,
            required: [true, "lecture video url is required"],
        },
        videoPublicId: {
            type: String,
            trim: true,
        },
        isPreviewFree: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 1,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        sectionId: {
            type: Types.ObjectId,
            ref: "Section",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

const Lecture = model("Lecture", lectureSchema);

export default Lecture;
