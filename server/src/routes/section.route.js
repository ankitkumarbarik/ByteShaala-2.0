import { Router } from "express";
import {
  createSection,
  deleteSection,
  getSectionsByCourse,
} from "../controllers/section.controller.js";
import verifyAuthentication from "../middlewares/authentication.middleware.js";
import verifyAuthorization from "../middlewares/authorization.middleware.js";
import ROLES from "../config/role.js";

const router = Router();

router
  .route("/:courseId/sections")
  .post(verifyAuthentication, verifyAuthorization(ROLES.ADMIN), createSection)
  .get(getSectionsByCourse);

router
  .route("/sections/:sectionId")
  .delete(verifyAuthentication, verifyAuthorization(ROLES.ADMIN), deleteSection);

export default router;
