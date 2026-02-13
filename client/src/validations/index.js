import * as yup from "yup";

// Yup validation schema for signup
export const signupSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .transform((value) => value?.replace(/\s+/g, " ").trim())
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name must be less than 30 characters")
    .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces")
    .test("no-only-spaces", "First name cannot be only spaces", (value) => {
      return value && value.trim().length > 0;
    }),
  lastName: yup
    .string()
    .required("Last name is required")
    .transform((value) => value?.replace(/\s+/g, " ").trim())
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name must be less than 30 characters")
    .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces")
    .test("no-only-spaces", "Last name cannot be only spaces", (value) => {
      return value && value.trim().length > 0;
    }),
  email: yup
    .string()
    .required("Email is required")
    .transform((value) => value?.trim().toLowerCase())
    .email("Please enter a valid email address")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email format"
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(18, "Password must be less than 18 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .test("no-spaces", "Password cannot contain spaces", (value) => {
      return !value || !/\s/.test(value);
    }),
  userType: yup
    .string()
    .oneOf(["STUDENT", "PROFESSIONAL"], "Please select a valid user type"),
  university: yup.string().when("userType", {
    is: "STUDENT",
    then: (schema) => schema.required("University is required for students"),
    otherwise: (schema) => schema.notRequired(),
  }),
  department: yup.string().when("userType", {
    is: "STUDENT",
    then: (schema) => schema.required("Department is required for students"),
    otherwise: (schema) => schema.notRequired(),
  }),
  program: yup.string().when("userType", {
    is: "STUDENT",
    then: (schema) => schema.required("Program is required for students"),
    otherwise: (schema) => schema.notRequired(),
  }),
  currentSemester: yup.string().when("userType", {
    is: "STUDENT",
    then: (schema) =>
      schema.required("Current semester is required for students"),
    otherwise: (schema) => schema.notRequired(),
  }),
  enrollmentNumber: yup
    .string()
    .transform((value) => value?.replace(/\s+/g, "").trim())
    .matches(
      /^[a-zA-Z0-9]*$/,
      "Enrollment number can only contain letters and numbers"
    ),
  interests: yup.array().of(yup.string()),
});

// Yup validation schema for login
export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .transform((value) => value?.trim().toLowerCase())
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(18, "Password must be less than 18 characters"),
});
