import { Router } from "express";
import {
    changeCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    deleteUser,
    getAllUsers,
    addPurchaseCourse,
    removeEnrolledCourse,
} from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
    changeCurrentPasswordSchema,
    updateAccountDetailsSchema,
} from "../validations/user.validation.js";
import upload from "../middlewares/multer.middleware.js";
import verifyAuthentication from "../middlewares/authentication.middleware.js";

const router = Router();

router
    .route("/change-password")
    .patch(
        verifyAuthentication,
        validate(changeCurrentPasswordSchema),
        changeCurrentPassword,
    );

router
    .route("/update-account")
    .patch(verifyAuthentication, upload.single("avatar"), updateAccountDetails);

router.route("/current-user").get(verifyAuthentication, getCurrentUser);

router.route("/delete-user/:userId").delete(verifyAuthentication, deleteUser);

router.route("/all-users").get(verifyAuthentication, getAllUsers);

router
    .route("/add-purchase-course")
    .post(verifyAuthentication, addPurchaseCourse);

// router.route("/get-user/:userId").get(getUserById);

router.patch(
    "/remove-enrolled-course",
    verifyAuthentication,
    removeEnrolledCourse,
);

export default router;
