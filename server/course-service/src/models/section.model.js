import { Schema, Types, model } from "mongoose";

// section schema
const sectionSchema = new Schema(
  {
    courseId: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Section = model("Section", sectionSchema);

export default Section;
