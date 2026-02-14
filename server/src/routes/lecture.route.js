import { Router } from "express";
import {
    addLecture,
    deleteLecture,
    getLecturesBySection,
    updateLecture,
} from "../controllers/lecture.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createLectureSchema,
    updateLectureSchema,
} from "../validations/lecture.validation.js";
import upload from "../middlewares/multer.middleware.js";
import verifyAuthentication from "../middlewares/authentication.middleware.js";
import verifyAuthorization from "../middlewares/authorization.middleware.js";
import ROLES from "../config/role.js";

const router = Router();

router
    .route("/sections/:sectionId/lectures")
    .post(
        verifyAuthentication,
        verifyAuthorization(ROLES.ADMIN),
        upload.single("video"),
        validate(createLectureSchema),
        addLecture
    )
    // .get(getLecturesBySection);

router
    .route("/sections/:sectionId/lectures/:lectureId")
    .patch(
        verifyAuthentication,
        verifyAuthorization(ROLES.ADMIN),
        upload.single("video"),
        validate(updateLectureSchema),
        updateLecture
    )
    .delete(verifyAuthentication, verifyAuthorization(ROLES.ADMIN), deleteLecture);

export default router;
