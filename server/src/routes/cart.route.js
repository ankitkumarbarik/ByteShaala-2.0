import { Router } from "express";
import {
    addToCart,
    getCart,
    removeFromCart,
    clearCart,
    removeCourseFromAllCarts,
} from "../controllers/cart.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
    addToCartSchema,
    removeFromCartSchema,
} from "../validations/cart.validation.js";
import verifyAuthentication from "../middlewares/authentication.middleware.js";

const router = Router();

router.route("/add-cart").post(verifyAuthentication, validate(addToCartSchema), addToCart);

router.route("/get-cart").get(verifyAuthentication, getCart);

router
    .route("/remove-cart")
    .delete(verifyAuthentication, validate(removeFromCartSchema), removeFromCart);

router.route("/clear-cart").delete(verifyAuthentication, clearCart);

router.patch("/remove-course", verifyAuthentication, removeCourseFromAllCarts);

export default router;
