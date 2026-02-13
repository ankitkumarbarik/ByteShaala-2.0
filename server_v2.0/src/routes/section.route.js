import { Router } from "express";
import {
  createSection,
  deleteSection,
  getSectionsByCourse,
} from "../controllers/section.controller.js";
import attachUser from "../middlewares/attachUser.middleware.js";
import verifyAuthorization from "../middlewares/authorization.middleware.js";
import ROLES from "../config/role.js";

const router = Router();

router
  .route("/:courseId/sections")
  .post(attachUser, verifyAuthorization(ROLES.ADMIN), createSection)
  .get(getSectionsByCourse);

router
  .route("/sections/:sectionId")
  .delete(attachUser, verifyAuthorization(ROLES.ADMIN), deleteSection);

export default router;
