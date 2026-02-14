import Joi from "joi";

export const createLectureSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "string.empty": `"title" is required`,
        "any.required": `"title" is required`,
    }),
    order: Joi.number().integer().min(1).optional().messages({
        "number.base": `"order" must be a number`,
        "number.min": `"order" must be at least 1`,
    }),
    videoUrl: Joi.string().trim().uri().optional().allow("").messages({
        "string.uri": `"videoUrl" must be a valid URL`,
    }),
    isPreviewFree: Joi.boolean().optional(),
});

export const updateLectureSchema = Joi.object({
    title: Joi.string().trim().optional().messages({
        "string.empty": `"title" cannot be empty`,
    }),
    order: Joi.number().integer().min(1).optional().messages({
        "number.base": `"order" must be a number`,
        "number.min": `"order" must be at least 1`,
    }),
    videoUrl: Joi.string().trim().uri().optional().allow("").messages({
        "string.uri": `"videoUrl" must be a valid URL`,
    }),
    isPreviewFree: Joi.boolean().optional(),
});
