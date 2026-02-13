import { baseApi } from "../store/api/baseApi";

// Admin API endpoints
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (filters = {}) => {
        let queryString = "user/all-users";
        const params = new URLSearchParams();

        if (filters.search) params.append("search", filters.search);
        if (filters.role) params.append("role", filters.role);
        if (filters.status) params.append("status", filters.status);
        if (filters.page) params.append("page", filters.page);
        if (filters.limit) params.append("limit", filters.limit);

        const paramsString = params.toString();
        if (paramsString) {
          queryString += `?${paramsString}`;
        }

        return queryString;
      },
      providesTags: ["getAllUsers"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/user/delete-user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["getAllUsers"],
    }),

    // Course Management Endpoints
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/course/create-course",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["getCourses"],
    }),

    updateCourse: builder.mutation({
      query: ({ slug, courseData }) => ({
        url: `/course/update-course/${slug}`,
        method: "PUT",
        body: courseData,
      }),
      invalidatesTags: ["getCourses", "getCourseById"],
    }),

    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/course/delete-course/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["getCourses"],
    }),

    // Section Management Endpoints
    createSection: builder.mutation({
      query: ({ courseId, sectionData }) => ({
        url: `/course/${courseId}/sections`,
        method: "POST",
        body: sectionData,
      }),
      invalidatesTags: ["getSections", "getCourseCurriculum"],
    }),

    getSectionsByCourse: builder.query({
      query: (courseId) => `/course/${courseId}/sections`,
      providesTags: ["getSections"],
    }),

    deleteSection: builder.mutation({
      query: (sectionId) => ({
        url: `/course/sections/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["getSections", "getCourseCurriculum"],
    }),

    // Lecture Management Endpoints
    addLecture: builder.mutation({
      query: ({ sectionId, lectureData }) => ({
        url: `/course/sections/${sectionId}/lectures`,
        method: "POST",
        body: lectureData,
      }),
      invalidatesTags: ["getLectures", "getCourseCurriculum"],
    }),

    getLecturesBySection: builder.query({
      query: (sectionId) => `/course/sections/${sectionId}/lectures`,
      providesTags: ["getLectures"],
    }),

    updateLecture: builder.mutation({
      query: ({ sectionId, lectureId, lectureData }) => ({
        url: `/course/sections/${sectionId}/lectures/${lectureId}`,
        method: "PATCH",
        body: lectureData,
      }),
      invalidatesTags: ["getLectures", "getCourseCurriculum"],
    }),

    deleteLecture: builder.mutation({
      query: ({ sectionId, lectureId }) => ({
        url: `/course/sections/${sectionId}/lectures/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["getLectures", "getCourseCurriculum"],
    }),

    // Get Course Curriculum (Sections + Lectures)
    getCourseCurriculum: builder.query({
      query: (courseId) => `/course/${courseId}/curriculum`,
      providesTags: ["getCourseCurriculum"],
    }),
  }),
});

// Export hooks for use in components
export const {
  // User Management Hooks
  useDeleteUserMutation,
  useGetAllUsersQuery,
  // Course Management Hooks
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  // Section Management Hooks
  useCreateSectionMutation,
  useGetSectionsByCourseQuery,
  useDeleteSectionMutation,
  // Lecture Management Hooks
  useAddLectureMutation,
  useGetLecturesBySectionQuery,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
  // Curriculum Hook
  useGetCourseCurriculumQuery,
} = adminApi;

export default adminApi;
