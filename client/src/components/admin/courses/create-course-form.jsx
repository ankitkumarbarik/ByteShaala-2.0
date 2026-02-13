import { yupResolver } from "@hookform/resolvers/yup";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as yup from "yup";

import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "@/actions/adminActions";
import { useGetCourseByIdQuery } from "@/actions/courseActions";
import CommonInput from "@/components/common/common-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Validation schema with comprehensive checks
const courseSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .transform((value) => value?.replace(/\s+/g, " ").trim())
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .test("no-only-spaces", "Title cannot be only spaces", (value) => {
      return value && value.trim().length > 0;
    }),
  description: yup
    .string()
    .required("Description is required")
    .transform((value) => value?.replace(/\s+/g, " ").trim())
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters")
    .test("no-only-spaces", "Description cannot be only spaces", (value) => {
      return value && value.trim().length > 0;
    }),
  category: yup
    .string()
    .required("Category is required")
    .test("not-empty", "Please select a category", (value) => {
      return value && value.trim().length > 0;
    }),
  price: yup
    .number()
    .transform((value, originalValue) => {
      // Handle empty string or invalid input
      return originalValue === "" || originalValue === null ? undefined : value;
    })
    .required("Price is required")
    .min(0, "Price cannot be negative")
    .max(1000000, "Price seems unreasonably high")
    .test("is-valid-number", "Price must be a valid number", (value) => {
      return !isNaN(value) && isFinite(value);
    })
    .test(
      "max-decimals",
      "Price can have at most 2 decimal places",
      (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      }
    ),
  originalPrice: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === "" || originalValue === null ? undefined : value;
    })
    .required("Original price is required")
    .min(0, "Original price cannot be negative")
    .max(1000000, "Original price seems unreasonably high")
    .test(
      "is-valid-number",
      "Original price must be a valid number",
      (value) => {
        return !isNaN(value) && isFinite(value);
      }
    )
    .test(
      "max-decimals",
      "Original price can have at most 2 decimal places",
      (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      }
    )
    .test(
      "greater-than-price",
      "Original price should be greater than or equal to price",
      function (value) {
        const { price } = this.parent;
        return value >= price;
      }
    ),
  currency: yup.string().required("Currency is required"),
  language: yup.string().required("Language is required"),
  level: yup.string().required("Level is required"),
  duration: yup
    .string()
    .required("Duration is required")
    .transform((value) => value?.replace(/\s+/g, " ").trim())
    .matches(
      /^[0-9]+\s*(hours?|hrs?|minutes?|mins?|weeks?|months?)$/i,
      "Duration must be in format like '10 hours', '5 weeks', '30 minutes'"
    )
    .test("no-only-spaces", "Duration cannot be only spaces", (value) => {
      return value && value.trim().length > 0;
    }),
  averageRating: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === "" || originalValue === null ? 0 : value;
    })
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .test(
      "max-decimals",
      "Rating can have at most 1 decimal place",
      (value) => {
        if (value === undefined || value === null || value === 0) return true;
        return /^\d+(\.\d{1})?$/.test(value.toString());
      }
    ),
  learningPoints: yup
    .array()
    .of(
      yup
        .string()
        .transform((value) => value?.replace(/\s+/g, " ").trim())
        .required("Learning point is required")
        .min(3, "Learning point must be at least 3 characters")
        .max(500, "Learning point must be less than 500 characters")
        .test(
          "no-only-spaces",
          "Learning point cannot be only spaces",
          (value) => {
            return value && value.trim().length > 0;
          }
        )
    )
    .min(1, "At least one learning point is required")
    .max(20, "Maximum 20 learning points allowed"),
  requirements: yup
    .array()
    .of(
      yup
        .string()
        .transform((value) => value?.replace(/\s+/g, " ").trim())
        .required("Requirement is required")
        .min(3, "Requirement must be at least 3 characters")
        .max(500, "Requirement must be less than 500 characters")
        .test(
          "no-only-spaces",
          "Requirement cannot be only spaces",
          (value) => {
            return value && value.trim().length > 0;
          }
        )
    )
    .min(1, "At least one requirement is required")
    .max(20, "Maximum 20 requirements allowed"),
  // courseContent removed - now managed only in Manage Curriculum page
});

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "AI/ML",
  "Cloud",
  "DevOps",
  "Cybersecurity",
  "UI/UX",
  "Programming",
];
const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

export function CreateCourseForm({ className, ...props }) {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const isEditMode = Boolean(courseId);

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const { data: courseData, isLoading: isFetching } = useGetCourseByIdQuery(
    courseId,
    {
      skip: !isEditMode,
    }
  );

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const methods = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      originalPrice: "",
      currency: "INR",
      language: "English",
      level: "Beginner",
      duration: "",
      averageRating: 0,
      tags: [],
      learningPoints: [""],
      requirements: [""],
    },
    resolver: yupResolver(courseSchema),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    register,
    reset,
  } = methods;

  const {
    fields: learningPointsFields,
    append: appendLearningPoint,
    remove: removeLearningPoint,
  } = useFieldArray({
    control: methods.control,
    name: "learningPoints",
  });

  const {
    fields: requirementsFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: methods.control,
    name: "requirements",
  });

  // Pre-fill form data for edit mode
  useEffect(() => {
    if (isEditMode && courseData?.data) {
      const course = courseData.data;
      reset({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        price: course.price || 0,
        originalPrice: course.originalPrice || 0,
        currency: course.currency || "INR",
        language: course.language || "English",
        level: course.level || "Beginner",
        duration: course.duration || "",
        averageRating: course.averageRating || 0,
        tags: course.tags || [],
        learningPoints: course.learningPoints?.length
          ? course.learningPoints
          : [""],
        requirements: course.requirements?.length ? course.requirements : [""],
      });
      setThumbnailPreview(course.thumbnail || "");
    }
  }, [courseData, isEditMode, reset]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const onSubmit = async (data) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Create payload object matching backend structure with sanitized data
      const payloadObj = {
        title: data.title.replace(/\s+/g, " ").trim(),
        description: data.description.replace(/\s+/g, " ").trim(),
        category: data.category.trim(),
        price: Number(data.price),
        originalPrice: Number(data.originalPrice),
        currency: data.currency,
        language: data.language,
        level: data.level,
        duration: data.duration.replace(/\s+/g, " ").trim(),
        averageRating: Number(data.averageRating) || 0,
        tags: data.tags || [],
        learningPoints: data.learningPoints
          .map((point) => point.replace(/\s+/g, " ").trim())
          .filter((point) => point.length > 0),
        requirements: data.requirements
          .map((req) => req.replace(/\s+/g, " ").trim())
          .filter((req) => req.length > 0),
      };

      // Additional validation
      if (payloadObj.price < 0 || payloadObj.originalPrice < 0) {
        toast.error("Prices cannot be negative");
        return;
      }

      if (payloadObj.originalPrice < payloadObj.price) {
        toast.error("Original price must be greater than or equal to price");
        return;
      }

      // Add payload as JSON string
      formData.append("payloadObj", JSON.stringify(payloadObj));

      // Add thumbnail file if present
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      } else if (!isEditMode) {
        toast.error("Please select a thumbnail image");
        return;
      }

      let result;
      if (isEditMode) {
        const course = courseData.data;
        result = await updateCourse({
          slug: course.slug,
          courseData: formData,
        }).unwrap();
        toast.success("Course updated successfully!");
      } else {
        result = await createCourse(formData).unwrap();
        console.log("resssssss", result);
        toast.success("Course created successfully!");
      }

      navigate("/admin/courses");
    } catch (error) {
      console.error("Course operation error:", error);
      toast.error(
        error?.data?.message ||
          `${isEditMode ? "Update" : "Creation"} failed. Please try again.`
      );
    }
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-white text-lg">Loading course data...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8">
            <div className="mb-8">
              <h2>{isEditMode ? "Edit Course" : "Create New Course"}</h2>
              <p className="text-gray-400">
                {isEditMode
                  ? "Update the course details below"
                  : "Fill in the details to create a new course"}
              </p>
            </div>

            <FormProvider {...methods}>
              <form
                className={cn("space-y-8", className)}
                onSubmit={handleSubmit(onSubmit)}
                {...props}
              >
                {/* Basic Information */}
                <div className="space-y-6">
                  <h4 className="text-white border-b border-gray-700 pb-2">
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CommonInput
                      name="title"
                      label="Course Title"
                      type="text"
                      placeholder="Enter course title"
                      required
                      {...register("title")}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Category
                      </label>
                      <select
                        {...register("category")}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-400 text-sm">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <CommonInput
                    name="description"
                    label="Description"
                    type="textarea"
                    placeholder="Enter course description"
                    required
                    rows={4}
                    {...register("description")}
                  />

                  {/* Thumbnail Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Course Thumbnail
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label
                          htmlFor="thumbnail-upload"
                          className="flex items-center justify-center w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Thumbnail
                        </label>
                      </div>
                      {thumbnailPreview && (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeThumbnail}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Details */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    Pricing & Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CommonInput
                      name="price"
                      label="Price"
                      type="number"
                      placeholder="0"
                      required
                      {...register("price")}
                    />

                    <CommonInput
                      name="originalPrice"
                      label="Original Price"
                      type="number"
                      placeholder="0"
                      required
                      {...register("originalPrice")}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Currency
                      </label>
                      <select
                        {...register("currency")}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CURRENCIES.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Language
                      </label>
                      <select
                        {...register("language")}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Level
                      </label>
                      <select
                        {...register("level")}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <CommonInput
                      name="duration"
                      label="Duration"
                      type="text"
                      placeholder="e.g., 36 hours"
                      required
                      {...register("duration")}
                    />
                  </div>

                  <CommonInput
                    name="averageRating"
                    label="Average Rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="4.5"
                    {...register("averageRating")}
                  />
                </div>

                {/* Learning Points */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    What Students Will Learn
                  </h4>

                  <div className="space-y-4">
                    {learningPointsFields.map((field, index) => (
                      <div key={field.id} className="flex items-end space-x-3">
                        <div className="flex-1">
                          <CommonInput
                            name={`learningPoints.${index}`}
                            label={`Learning Point ${index + 1}`}
                            type="text"
                            placeholder="Enter what students will learn"
                            required
                            {...register(`learningPoints.${index}`)}
                          />
                        </div>
                        {learningPointsFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLearningPoint(index)}
                            className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => appendLearningPoint("")}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Learning Point</span>
                  </button>
                </div>

                {/* Requirements */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    Requirements
                  </h4>

                  <div className="space-y-4">
                    {requirementsFields.map((field, index) => (
                      <div key={field.id} className="flex items-end space-x-3">
                        <div className="flex-1">
                          <CommonInput
                            name={`requirements.${index}`}
                            label={`Requirement ${index + 1}`}
                            type="text"
                            placeholder="Enter course requirement"
                            required
                            {...register(`requirements.${index}`)}
                          />
                        </div>
                        {requirementsFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => appendRequirement("")}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Requirement</span>
                  </button>
                </div>

                {/* Course Content Section Removed - Now managed in Manage Curriculum page */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold !text-blue-400 mb-2">
                        Course Sections & Lectures
                      </h4>
                      <p className="text-gray-300 text-sm mb-3">
                        After creating the course, you can add sections and
                        lectures from the{" "}
                        <span className="font-semibold text-white">
                          &ldquo;Manage Curriculum&rdquo;
                        </span>{" "}
                        page.
                      </p>
                      <p className="text-gray-400 text-xs">
                        This allows you to organize your course content with
                        sections, upload lecture videos, and manage the
                        curriculum structure. sections, upload lecture videos,
                        and manage the curriculum structure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center space-x-4 pt-6">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
                    disabled={isSubmitting || isCreating || isUpdating}
                  >
                    {isSubmitting || isCreating || isUpdating
                      ? `${isEditMode ? "Updating" : "Creating"} Course...`
                      : `${isEditMode ? "Update" : "Create"} Course`}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/courses")}
                    className="px-8 py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
