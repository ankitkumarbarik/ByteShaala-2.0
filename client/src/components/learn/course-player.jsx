import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  PlayCircle,
  Lock,
  FileText,
  Download,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import VideoPlayer from "./video-player";

import { useGetCourseCurriculumQuery } from "@/actions/adminActions";
import { useGetCourseByIdQuery } from "@/actions/courseActions";
import { useGetUserProfileQuery } from "@/actions/profileActions";
import { AuthContext } from "@/context/AuthContext";

const CoursePlayer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { authenticated } = useContext(AuthContext);

  // Fetch course and curriculum
  const { data: courseData, isLoading: courseLoading } =
    useGetCourseByIdQuery(slug);
  const { data: curriculumData, isLoading: curriculumLoading } =
    useGetCourseCurriculumQuery(courseData?.data?._id, {
      skip: !courseData?.data?._id,
    });
  const { data: profileData } = useGetUserProfileQuery(undefined, {
    skip: !authenticated,
  });

  const course = courseData?.data;
  const curriculum = curriculumData?.data || [];

  // Check if user is enrolled
  const enrolledCourses =
    profileData?.data?.enrolledCourses || profileData?.enrolledCourses || [];
  const isEnrolled = enrolledCourses.some(
    (c) => c?._id === course?._id || c?.slug === course?.slug
  );

  // State
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({});

  // Open sidebar on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize first lecture
  useEffect(() => {
    if (curriculum.length > 0 && !currentLecture) {
      const firstSection = curriculum[0];
      const firstLecture = firstSection.lectures?.[0];
      if (firstLecture) {
        setCurrentSection(firstSection);
        setCurrentLecture(firstLecture);
        setExpandedSections({ [firstSection._id]: true });
      }
    }
  }, [curriculum, currentLecture]);

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Select lecture
  const selectLecture = (lecture, section) => {
    // Check if lecture is locked (not preview and user not enrolled)
    if (!lecture.isPreviewFree && !isEnrolled) {
      toast.error(
        "This lecture is locked. Please purchase the course to access all content."
      );
      return;
    }
    setCurrentLecture(lecture);
    setCurrentSection(section);
  };

  // Mark lecture as complete
  const markLectureComplete = () => {
    if (currentLecture) {
      setCompletedLectures((prev) => new Set([...prev, currentLecture._id]));
      toast.success("Lecture marked as complete!");
    }
  };

  // Navigate to next lecture
  const goToNextLecture = () => {
    if (!currentSection || !currentLecture) return;

    const currentSectionIndex = curriculum.findIndex(
      (s) => s._id === currentSection._id
    );
    const currentLectureIndex = currentSection.lectures.findIndex(
      (l) => l._id === currentLecture._id
    );

    // Check if there's a next lecture in current section
    if (currentLectureIndex < currentSection.lectures.length - 1) {
      const nextLecture = currentSection.lectures[currentLectureIndex + 1];
      selectLecture(nextLecture, currentSection);
    }
    // Check if there's a next section
    else if (currentSectionIndex < curriculum.length - 1) {
      const nextSection = curriculum[currentSectionIndex + 1];
      const nextLecture = nextSection.lectures?.[0];
      if (nextLecture) {
        selectLecture(nextLecture, nextSection);
        setExpandedSections((prev) => ({ ...prev, [nextSection._id]: true }));
      }
    } else {
      toast.info("You've completed all lectures!");
    }
  };

  // Navigate to previous lecture
  const goToPreviousLecture = () => {
    if (!currentSection || !currentLecture) return;

    const currentSectionIndex = curriculum.findIndex(
      (s) => s._id === currentSection._id
    );
    const currentLectureIndex = currentSection.lectures.findIndex(
      (l) => l._id === currentLecture._id
    );

    // Check if there's a previous lecture in current section
    if (currentLectureIndex > 0) {
      const prevLecture = currentSection.lectures[currentLectureIndex - 1];
      selectLecture(prevLecture, currentSection);
    }
    // Check if there's a previous section
    else if (currentSectionIndex > 0) {
      const prevSection = curriculum[currentSectionIndex - 1];
      const prevLecture =
        prevSection.lectures?.[prevSection.lectures.length - 1];
      if (prevLecture) {
        selectLecture(prevLecture, prevSection);
        setExpandedSections((prev) => ({ ...prev, [prevSection._id]: true }));
      }
    }
  };

  // Calculate progress
  const totalLectures = curriculum.reduce(
    (acc, section) => acc + (section.lectures?.length || 0),
    0
  );
  const progress = totalLectures
    ? (completedLectures.size / totalLectures) * 100
    : 0;

  if (courseLoading || curriculumLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading course...</div>
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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <button
              onClick={() => navigate(`/courses/${slug}`)}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">
                {course.title}
              </h1>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                {isEnrolled ? (
                  <>
                    <span className="hidden sm:inline">
                      {completedLectures.size} / {totalLectures} lectures
                      completed
                    </span>
                    <span className="sm:hidden">
                      {completedLectures.size}/{totalLectures}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{Math.round(progress)}%</span>
                  </>
                ) : (
                  <span className="text-yellow-400 font-medium truncate">
                    <span className="hidden sm:inline">
                      Preview Mode - Purchase to unlock all lectures
                    </span>
                    <span className="sm:hidden">Preview Mode</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {!isEnrolled && (
              <button
                onClick={() => navigate(`/courses/${slug}`)}
                className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Buy</span>
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:text-blue-400 transition-colors p-2"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-700">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col bg-gray-900 w-full lg:w-auto">
          {currentLecture ? (
            <>
              <VideoPlayer
                videoUrl={currentLecture.videoUrl}
                lectureTitle={currentLecture.title}
              />

              {/* Lecture Info & Navigation */}
              <div className="bg-gray-800 p-3 sm:p-4 border-t border-gray-700">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-white text-base sm:text-lg lg:text-xl font-semibold mb-1 line-clamp-2">
                      {currentLecture.title}
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                      {currentSection?.title}
                    </p>
                  </div>
                  <button
                    onClick={markLectureComplete}
                    className={`hidden md:flex px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-shrink-0 ${
                      completedLectures.has(currentLecture._id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {completedLectures.has(currentLecture._id) ? (
                      <span className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden lg:inline">Completed</span>
                        <span className="lg:hidden">✓</span>
                      </span>
                    ) : (
                      <span className="hidden lg:inline">Mark as Complete</span>
                    )}
                  </button>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={goToPreviousLecture}
                    className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex lg:hidden items-center justify-center space-x-1 sm:space-x-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm flex-1"
                  >
                    <Menu className="w-4 h-4" />
                    <span>Curriculum</span>
                  </button>
                  <button
                    onClick={goToNextLecture}
                    className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm flex-1 sm:flex-initial"
                  >
                    <span className="hidden sm:inline">Next Lecture</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  Select a lecture to start learning
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Curriculum Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          } ${sidebarOpen ? "" : "lg:w-0"} w-full lg:w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto transition-all duration-300 fixed lg:relative inset-y-0 right-0 z-20 lg:z-10`}
        >
          {/* Backdrop for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className="p-3 sm:p-4 relative z-20 bg-gray-800">
            <div className="flex items-center justify-between mb-3 sm:mb-4 sticky top-0 bg-gray-800 pb-2 border-b border-gray-700">
              <h3 className="text-white font-semibold text-base sm:text-lg">
                Course Content
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sections & Lectures */}
            <div className="space-y-2 sm:space-y-3">
              {curriculum.map((section, sectionIndex) => (
                <div
                  key={section._id}
                  className="bg-transparent rounded-lg overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-start justify-between hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-gray-400 text-sm font-medium mb-1">
                        Section {sectionIndex + 1}
                      </p>
                      <p className="text-white font-semibold text-sm mb-1 leading-snug">
                        {section.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {section.lectures?.length || 0} items
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 mt-1 ${
                        expandedSections[section._id] ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Lectures List */}
                  {expandedSections[section._id] && (
                    <div className="bg-gray-750">
                      {section.lectures && section.lectures.length > 0 ? (
                        section.lectures.map((lecture, lectureIndex) => {
                          const isActive = currentLecture?._id === lecture._id;
                          const isCompleted = completedLectures.has(
                            lecture._id
                          );
                          const isLocked =
                            !lecture.isPreviewFree && !isEnrolled;

                          return (
                            <button
                              key={lecture._id}
                              onClick={() => selectLecture(lecture, section)}
                              disabled={isLocked}
                              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center space-x-2 sm:space-x-3 transition-colors border-b border-gray-700 last:border-b-0 ${
                                isLocked
                                  ? "opacity-60 cursor-not-allowed"
                                  : "hover:bg-gray-600"
                              } ${
                                isActive
                                  ? "bg-gray-600 border-l-4 border-l-blue-500"
                                  : ""
                              }`}
                            >
                              {/* Status Icon */}
                              <div className="flex-shrink-0">
                                {isLocked ? (
                                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                ) : isCompleted ? (
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                ) : lecture.isPreviewFree ? (
                                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                )}
                              </div>

                              {/* Lecture Info */}
                              <div className="flex-1 text-left min-w-0">
                                <p
                                  className={`text-xs sm:text-sm font-medium line-clamp-2 ${
                                    isLocked
                                      ? "text-gray-500"
                                      : isActive
                                        ? "text-blue-400"
                                        : "text-white"
                                  }`}
                                >
                                  {lectureIndex + 1}. {lecture.title}
                                </p>
                                {lecture.isPreviewFree && !isEnrolled && (
                                  <span className="text-xs text-green-400 mt-0.5 inline-block">
                                    Free Preview
                                  </span>
                                )}
                                {isLocked && (
                                  <span className="text-xs text-gray-500 mt-0.5 inline-block">
                                    Locked
                                  </span>
                                )}
                              </div>

                              {/* Playing Indicator */}
                              {isActive && (
                                <div className="flex-shrink-0">
                                  <div className="w-1 h-6 sm:h-8 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-gray-400 text-sm text-center">
                          No lectures available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
