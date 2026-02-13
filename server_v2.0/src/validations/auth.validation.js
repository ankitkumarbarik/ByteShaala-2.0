import Joi from "joi";

export const registerUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    "string.empty": `"firstName" is required`,
  }),
  lastName: Joi.string().required().messages({
    "string.empty": `"lastName" is required`,
  }),
  email: Joi.string().email().required().messages({
    "string.empty": `"email" is required`,
    "string.email": `"email" must be a valid email`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": `"password" is required`,
    "string.min": `"password" must be at least 6 characters`,
  }),
  // User Type - Step 2
  userType: Joi.string().valid("STUDENT", "PROFESSIONAL").required().messages({
    "string.empty": `"userType" is required`,
    "any.only": `"userType" must be either STUDENT or PROFESSIONAL`,
    "any.required": `"userType" is required`,
  }),
  // Interests - Step 3B (optional)
  interests: Joi.array().items(Joi.string()).optional().default([]).messages({
    "array.base": `"interests" must be an array`,
    "any.only": `"interests" contains invalid category`,
  }),
  // Academic Details - Step 3A (for STUDENT type)
  academicDetails: Joi.object({
    university: Joi.string().trim().optional().allow("").messages({
      "string.base": `"university" must be a string`,
    }),
    department: Joi.string()
      .valid(
        "Computer Science & IT",
        "Business Administration",
        "Commerce",
        "Arts & Humanities",
        "Science",
        "Other"
      )
      .optional()
      .allow("")
      .messages({
        "any.only": `"department" must be a valid department`,
      }),
    program: Joi.string().trim().optional().allow("").messages({
      "string.base": `"program" must be a string`,
    }),
    currentSemester: Joi.string()
      .valid(
        "Sem-1",
        "Sem-2",
        "Sem-3",
        "Sem-4",
        "Sem-5",
        "Sem-6",
        "Sem-7",
        "Sem-8"
      )
      .optional()
      .allow("")
      .messages({
        "any.only": `"currentSemester" must be a valid semester`,
      }),
    enrollmentNumber: Joi.string().trim().optional().allow("").messages({
      "string.base": `"enrollmentNumber" must be a string`,
    }),
  })
    .optional()
    .default({})
    .messages({
      "object.base": `"academicDetails" must be an object`,
    }),
});

export const verifyOtpSignupSchema = Joi.object({
  otpSignup: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": `"otpSignup" must be a 6-digit number`,
      "string.empty": `"otpSignup" is required`,
      "any.required": `"otpSignup" is required`,
    }),
});

export const resendOtpSignupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": `"email" must be a valid email`,
    "string.empty": `"email" is required`,
    "any.required": `"email" is required`,
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": `"email" is required`,
    "string.email": `"email" must be a valid email`,
    "any.required": `"email" is required`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": `"password" is required`,
    "string.min": `"password" must be at least 6 characters`,
    "any.required": `"password" is required`,
  }),
});

export const forgetUserPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": `"email" is required`,
    "string.email": `"email" must be a valid email`,
  }),
});

export const resetUserPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    "string.empty": `"newPassword" is required`,
    "string.min": `"newPassword" must be at least 6 characters`,
  }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "any.only": `"confirmPassword" must match "newPassword"`,
      "string.empty": `"confirmPassword" is required`,
    }),
});
