import { Router } from "express";
import {
    createCourse,
    updateCourse,
    deleteCourse,
    getAllCourses,
    getCourseById,
    getCourseByObjectId,
    addReviews,
    getAllReviews,
    getCourseCurriculum,
} from "../controllers/course.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
    updateCourseSchema,
    reviewSchema,
} from "../validations/course.validation.js";
import upload from "../middlewares/multer.middleware.js";
import verifyAuthentication from "../middlewares/authentication.middleware.js";
import verifyAuthorization from "../middlewares/authorization.middleware.js";
import ROLES from "../config/role.js";

const router = Router();

router
    .route("/create-course")
    .post(
        verifyAuthentication,
        verifyAuthorization(ROLES.ADMIN),
        upload.single("thumbnail"),
        createCourse
    );
// router
//   .route("/create-course")
//   .post(
//     attachUser,
//     verifyAuthorization(ROLES.ADMIN),
//     upload.single("thumbnail"),
//     validate(createCourseSchema),
//     createCourse
//   );

router
    .route("/update-course/:slug")
    .put(
        verifyAuthentication,
        verifyAuthorization(ROLES.ADMIN),
        upload.single("thumbnail"),
        validate(updateCourseSchema),
        updateCourse
    );

router
    .route("/delete-course/:courseId")
    .delete(verifyAuthentication, verifyAuthorization(ROLES.ADMIN), deleteCourse);

router.route("/get-all-courses").get(getAllCourses);

router.route("/get-course/:slug").get(getCourseById);

router.route("/:courseId/curriculum").get(getCourseCurriculum);

// Backward compatibility route for cart service (uses ObjectId)
router.route("/get-course-by-id/:courseId").get(getCourseByObjectId);

// add reviews
router
    .route("/add-reviews/:courseId")
    .post(verifyAuthentication, validate(reviewSchema), addReviews);

// get all reviews
router.route("/get-all-reviews").get(getAllReviews);

export default router;
