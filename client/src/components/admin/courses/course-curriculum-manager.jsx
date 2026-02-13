import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Video,
} from "lucide-react";
import {
  useGetCourseCurriculumQuery,
  useCreateSectionMutation,
  useDeleteSectionMutation,
  useAddLectureMutation,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
} from "@/actions/adminActions";
import { useGetCourseByIdQuery } from "@/actions/courseActions";
import { Button } from "@/components/ui/button";

const CourseCurriculumManager = () => {
  const { id: courseSlug } = useParams();
  const navigate = useNavigate();

  // Fetch course and curriculum data
  const { data: courseData, isLoading: courseLoading } =
    useGetCourseByIdQuery(courseSlug);
  const { data: curriculumData, isLoading: curriculumLoading } =
    useGetCourseCurriculumQuery(courseData?.data?._id, {
      skip: !courseData?.data?._id,
    });

  // Mutations
  const [createSection] = useCreateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [addLecture] = useAddLectureMutation();
  const [updateLecture] = useUpdateLectureMutation();
  const [deleteLecture] = useDeleteLectureMutation();

  // Local state
  const [expandedSections, setExpandedSections] = useState({});
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [addingSectionFor, setAddingSectionFor] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);

  // Lecture form state
  const [lectureForm, setLectureForm] = useState({
    title: "",
    videoUrl: "",
    videoFile: null,
    order: 1,
    isPreviewFree: false,
  });

  const course = courseData?.data;
  const curriculum = curriculumData?.data || [];

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }

    try {
      await createSection({
        courseId: course._id,
        sectionData: {
          title: newSectionTitle.trim(),
          description: newSectionDescription.trim(),
          order: curriculum.length + 1,
        },
      }).unwrap();

      toast.success("Section created successfully");
      setNewSectionTitle("");
      setNewSectionDescription("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (
      !confirm("Are you sure? This will delete all lectures in this section.")
    ) {
      return;
    }

    try {
      await deleteSection(sectionId).unwrap();
      toast.success("Section deleted successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete section");
    }
  };

  const handleAddLecture = async (sectionId) => {
    if (!lectureForm.title.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    if (!lectureForm.videoUrl.trim() && !lectureForm.videoFile) {
      toast.error("Please provide a video URL or upload a video file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", lectureForm.title.trim());
      formData.append("order", lectureForm.order);
      formData.append("isPreviewFree", lectureForm.isPreviewFree);

      if (lectureForm.videoFile) {
        formData.append("video", lectureForm.videoFile);
      } else {
        formData.append("videoUrl", lectureForm.videoUrl.trim());
      }

      await addLecture({
        sectionId,
        lectureData: formData,
      }).unwrap();

      toast.success("Lecture added successfully");
      setAddingSectionFor(null);
      setLectureForm({
        title: "",
        videoUrl: "",
        videoFile: null,
        order: 1,
        isPreviewFree: false,
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add lecture");
    }
  };

  const handleUpdateLecture = async (sectionId, lectureId) => {
    if (!lectureForm.title.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", lectureForm.title.trim());
      formData.append("order", lectureForm.order);
      formData.append("isPreviewFree", lectureForm.isPreviewFree);

      if (lectureForm.videoFile) {
        formData.append("video", lectureForm.videoFile);
      } else if (lectureForm.videoUrl.trim()) {
        formData.append("videoUrl", lectureForm.videoUrl.trim());
      }

      await updateLecture({
        sectionId,
        lectureId,
        lectureData: formData,
      }).unwrap();

      toast.success("Lecture updated successfully");
      setEditingLecture(null);
      setLectureForm({
        title: "",
        videoUrl: "",
        videoFile: null,
        order: 1,
        isPreviewFree: false,
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update lecture");
    }
  };

  const handleDeleteLecture = async (sectionId, lectureId) => {
    if (!confirm("Are you sure you want to delete this lecture?")) {
      return;
    }

    try {
      await deleteLecture({ sectionId, lectureId }).unwrap();
      toast.success("Lecture deleted successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete lecture");
    }
  };

  const startEditingLecture = (lecture, sectionId) => {
    setEditingLecture({ ...lecture, sectionId });
    setLectureForm({
      title: lecture.title,
      videoUrl: lecture.videoUrl || "",
      videoFile: null,
      order: lecture.order,
      isPreviewFree: lecture.isPreviewFree,
    });
  };

  const cancelEdit = () => {
    setEditingLecture(null);
    setAddingSectionFor(null);
    setLectureForm({
      title: "",
      videoUrl: "",
      videoFile: null,
      order: 1,
      isPreviewFree: false,
    });
  };

  if (courseLoading || curriculumLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Manage Course Curriculum
                </h1>
                <p className="text-gray-400">{course.title}</p>
              </div>
              <Button
                onClick={() => navigate("/admin/courses")}
                variant="outline"
                className="text-white"
              >
                Back to Courses
              </Button>
            </div>
          </div>

          {/* Add New Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add New Section
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Enter section title"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newSectionDescription}
                onChange={(e) => setNewSectionDescription(e.target.value)}
                placeholder="Enter section description (optional)"
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <Button
                onClick={handleCreateSection}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            {curriculum.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No sections yet. Add your first section to get started.
                </p>
              </div>
            ) : (
              curriculum.map((section) => (
                <div key={section._id} className="bg-gray-800 rounded-lg">
                  {/* Section Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => toggleSection(section._id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {expandedSections[section._id] ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">
                            {section.title}
                          </h4>
                          {section.description && (
                            <p className="text-sm text-gray-400 mt-1">
                              {section.description}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {section.lectures?.length || 0} lectures
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setAddingSectionFor(section._id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lecture
                        </Button>
                        <Button
                          onClick={() => handleDeleteSection(section._id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Section Content */}
                  {expandedSections[section._id] && (
                    <div className="p-4 space-y-4">
                      {/* Lectures List */}
                      {section.lectures && section.lectures.length > 0 ? (
                        <div className="space-y-3">
                          {section.lectures.map((lecture) => (
                            <div
                              key={lecture._id}
                              className="bg-gray-700 rounded-lg p-4"
                            >
                              {editingLecture?._id === lecture._id ? (
                                // Edit Mode
                                <LectureForm
                                  lectureForm={lectureForm}
                                  setLectureForm={setLectureForm}
                                  onSave={() =>
                                    handleUpdateLecture(
                                      section._id,
                                      lecture._id
                                    )
                                  }
                                  onCancel={cancelEdit}
                                  isEditing
                                />
                              ) : (
                                // View Mode
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Video className="w-4 h-4 text-blue-400" />
                                      <h5 className="text-white font-medium">
                                        {lecture.title}
                                      </h5>
                                      {lecture.isPreviewFree && (
                                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                          Free Preview
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">
                                      {lecture.videoUrl}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <Button
                                      onClick={() =>
                                        startEditingLecture(
                                          lecture,
                                          section._id
                                        )
                                      }
                                      size="sm"
                                      className="bg-orange-500 hover:bg-orange-600"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDeleteLecture(
                                          section._id,
                                          lecture._id
                                        )
                                      }
                                      size="sm"
                                      variant="destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          No lectures yet. Add your first lecture.
                        </p>
                      )}

                      {/* Add Lecture Form */}
                      {addingSectionFor === section._id && (
                        <div className="bg-gray-700 rounded-lg p-4 mt-4">
                          <h5 className="text-white font-medium mb-4">
                            Add New Lecture
                          </h5>
                          <LectureForm
                            lectureForm={lectureForm}
                            setLectureForm={setLectureForm}
                            onSave={() => handleAddLecture(section._id)}
                            onCancel={cancelEdit}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Lecture Form Component
const LectureForm = ({
  lectureForm,
  setLectureForm,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const [uploadMethod, setUploadMethod] = useState("url"); // 'url' or 'file'

  return (
    <div className="space-y-4">
      {/* Lecture Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Lecture Title *
        </label>
        <input
          type="text"
          value={lectureForm.title}
          onChange={(e) =>
            setLectureForm({ ...lectureForm, title: e.target.value })
          }
          placeholder="Enter lecture title"
          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Upload Method Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Video Source *
        </label>
        <div className="flex space-x-2 mb-3">
          <button
            type="button"
            onClick={() => setUploadMethod("url")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMethod === "url"
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            Video URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod("file")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMethod === "file"
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload File
          </button>
        </div>

        {uploadMethod === "url" ? (
          <input
            type="url"
            value={lectureForm.videoUrl}
            onChange={(e) =>
              setLectureForm({ ...lectureForm, videoUrl: e.target.value })
            }
            placeholder="https://example.com/video.mp4 or YouTube URL"
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setLectureForm({
                  ...lectureForm,
                  videoFile: e.target.files[0],
                })
              }
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="flex items-center justify-center w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-pointer hover:bg-gray-500 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              {lectureForm.videoFile
                ? lectureForm.videoFile.name
                : "Choose video file"}
            </label>
          </div>
        )}
      </div>

      {/* Order and Preview Free */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Order
          </label>
          <input
            type="number"
            min="1"
            value={lectureForm.order}
            onChange={(e) =>
              setLectureForm({
                ...lectureForm,
                order: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lectureForm.isPreviewFree}
              onChange={(e) =>
                setLectureForm({
                  ...lectureForm,
                  isPreviewFree: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Free Preview</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-2">
        <Button
          onClick={onSave}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? "Update" : "Add"} Lecture
        </Button>
        <Button onClick={onCancel} variant="outline" className="text-white">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CourseCurriculumManager;
