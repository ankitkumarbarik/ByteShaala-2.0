import { yupResolver } from "@hookform/resolvers/yup";
import { GraduationCap, Briefcase, Check } from "lucide-react";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useRegisterMutation } from "@/actions/authActions";
import CommonInput from "@/components/common/common-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signupSchema } from "@/validations";

const TOTAL_STEPS = 4;

// Interest categories with icons
const INTERESTS = [
  {
    id: "Web Development",
    label: "Web Development",
    icon: "💻",
    desc: "HTML, CSS, JavaScript, React, Node.js",
  },
  {
    id: "UI/UX Design",
    label: "UI/UX Design",
    icon: "🎨",
    desc: "Figma, Adobe XD, User Research",
  },
  {
    id: "Data Science",
    label: "Data Science",
    icon: "📊",
    desc: "Python, Machine Learning, Analytics",
  },
  {
    id: "Mobile Development",
    label: "Mobile Development",
    icon: "📱",
    desc: "Flutter, React Native, Android, iOS",
  },
  {
    id: "Digital Marketing",
    label: "Digital Marketing",
    icon: "📈",
    desc: "SEO, Social Media, Content Marketing",
  },
  {
    id: "Photography & Video Editing",
    label: "Photography & Video Editing",
    icon: "📷",
    desc: "Photoshop, Premiere Pro, Lightroom",
  },
  {
    id: "Business & Finance",
    label: "Business & Finance",
    icon: "💼",
    desc: "Accounting, Stock Market, Entrepreneurship",
  },
  {
    id: "Music & Audio Production",
    label: "Music & Audio Production",
    icon: "🎵",
    desc: "Music Theory, Mixing, Mastering",
  },
];

const UNIVERSITIES = [
  "Veer Narmad South Gujarat University (VNSGU)",
  "Bhakta Kavi Narsinh Mehta University (BKNMU)",
  "Gujarat University",
  "Saurashtra University",
  "Other",
];

const DEPARTMENTS = [
  "Computer Science & IT",
  "Business Administration",
  "Commerce",
  "Arts & Humanities",
  "Science",
  "Other",
];

const PROGRAMS = [
  "BCA (Bachelor of Computer Applications)",
  "BBA (Bachelor of Business Administration)",
  "B.Com (Bachelor of Commerce)",
  "BSc IT",
];

const SEMESTERS = ["Sem-1", "Sem-2", "Sem-3", "Sem-4", "Sem-5", "Sem-6"];

export function SignupForm({ className, ...props }) {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  const methods = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userType: "",
      university: "",
      department: "",
      program: "",
      currentSemester: "",
      enrollmentNumber: "",
      interests: [],
    },
    resolver: yupResolver(signupSchema),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    register: registerField,
    setValue,
    watch,
    trigger,
  } = methods;

  const watchedFields = watch();

  const nextStep = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ["firstName", "lastName", "email", "password"];
    } else if (currentStep === 2) {
      if (!selectedUserType) {
        toast.error("Please select a user type");
        return;
      }
      setValue("userType", selectedUserType);
    } else if (currentStep === 3 && selectedUserType === "STUDENT") {
      fieldsToValidate = [
        "university",
        "department",
        "program",
        "currentSemester",
      ];
    }

    const isValid =
      fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      return [...prev, interest];
    });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        userType: selectedUserType,
        interests: selectedInterests,
      };

      if (selectedUserType === "STUDENT") {
        payload.academicDetails = {
          university: data.university,
          department: data.department,
          program: data.program,
          currentSemester: data.currentSemester,
          enrollmentNumber: data.enrollmentNumber || "",
        };
      }

      await register(payload).unwrap();
      toast.success("Account created successfully! Please verify your email.");
      navigate("/verify-otp", {
        state: {
          email: data.email,
          message: "Please check your email for the verification code.",
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">
          Step {currentStep} of {TOTAL_STEPS}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 text-center mb-6">
        <h2 className="text-2xl font-bold">Create account</h2>
        <p className="text-gray-400 text-sm">
          Enter your details below to create your account
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CommonInput
          name="firstName"
          label="First Name"
          type="text"
          placeholder="John"
          required
        />
        <CommonInput
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Doe"
          required
        />
      </div>

      <CommonInput
        name="email"
        label="Email"
        type="email"
        placeholder="m@example.com"
        required
      />

      <CommonInput
        name="password"
        label="Password"
        type="password"
        placeholder="Create a strong password"
        required
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center mb-4">
        <h5 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 flex-wrap justify-center">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>Choose Your Learning Path</span>
        </h5>
        <p className="text-gray-400 text-xs sm:text-sm">User Type</p>
      </div>

      <div className="space-y-4">
        <p className="text-gray-300 text-sm">Tell us about yourself:</p>

        {/* Student Option */}
        <button
          type="button"
          onClick={() => setSelectedUserType("STUDENT")}
          className={cn(
            "w-full p-4 sm:p-6 rounded-lg border-2 transition-all text-left",
            selectedUserType === "STUDENT"
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
          )}
        >
          <div className="flex items-start gap-3">
            <GraduationCap className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-base sm:text-lg mb-2">
                I'm a College/University Student
              </p>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" /> Access
                  syllabus-based content
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" /> Auto-enrolled in
                  semester subjects
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" /> Plus browse skill
                  courses
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Perfect for: BCA, BBA, B.Com students
              </p>
            </div>
          </div>
          {selectedUserType === "STUDENT" && (
            <div className="mt-3 text-center text-sm text-blue-500 font-medium">
              [Selected →]
            </div>
          )}
        </button>

        {/* Professional Option */}
        <button
          type="button"
          onClick={() => setSelectedUserType("PROFESSIONAL")}
          className={cn(
            "w-full p-4 sm:p-6 rounded-lg border-2 transition-all text-left",
            selectedUserType === "PROFESSIONAL"
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
          )}
        >
          <div className="flex items-start gap-3">
            <Briefcase className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-base sm:text-lg mb-2">
                I want to Learn New Skills
                <span className="text-sm text-gray-400 block">
                  (Not currently a student)
                </span>
              </p>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" /> Browse 500+ skill
                  courses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" /> Learn at your own
                  pace
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" /> No academic
                  requirements
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Perfect for: Professionals, Freelancers
              </p>
            </div>
          </div>
          {selectedUserType === "PROFESSIONAL" && (
            <div className="mt-3 text-center text-sm text-purple-500 font-medium">
              [Selected →]
            </div>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (selectedUserType === "PROFESSIONAL") {
      setCurrentStep(4);
      return null;
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 mb-4">
          <h5 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 flex-wrap">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Academic Information</span>
          </h5>
          <p className="text-gray-400 text-xs sm:text-sm">Academic Details</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Your University <span className="text-red-500">*</span>
            </label>
            <select
              {...registerField("university")}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose your university</option>
              {UNIVERSITIES.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Department <span className="text-red-500">*</span>
            </label>
            <select
              {...registerField("department")}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Your Program/Course <span className="text-red-500">*</span>
            </label>
            <select
              {...registerField("program")}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose program</option>
              {PROGRAMS.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Current Semester <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SEMESTERS.map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setValue("currentSemester", sem)}
                  className={cn(
                    "p-2 rounded-md border text-[11px] font-medium transition-all whitespace-nowrap",
                    watchedFields.currentSemester === sem
                      ? "border-blue-500 bg-blue-500/20 text-blue-500"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  )}
                >
                  {sem}
                </button>
              ))}
            </div>
            {watchedFields.currentSemester && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <Check className="w-3 h-3" /> (Selected)
              </p>
            )}
          </div>

          <CommonInput
            name="enrollmentNumber"
            label="Enrollment/Roll Number (Optional)"
            type="text"
            placeholder="e.g., BCA2024150B47"
          />
          <p className="text-xs text-yellow-500 flex items-center gap-1">
            💡 You can add this later in profile settings
          </p>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-4">
        <h5 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
          <span>🎯 Your Interests</span>
        </h5>
        <p className="text-gray-400 text-xs sm:text-sm">Interests (Optional)</p>
      </div>

      <div className="space-y-4">
        <p className="text-gray-300 text-sm">
          Help us recommend the best courses for you!
          <br />
          <span className="text-gray-500 text-xs">
            (You can skip this step)
          </span>
        </p>

        <p className="text-gray-400 text-sm">
          Select categories you're interested in:
        </p>

        <div className="grid grid-cols-1 gap-3">
          {INTERESTS.map((interest) => (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggleInterest(interest.id)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                selectedInterests.includes(interest.id)
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-700 text-xl sm:text-2xl flex-shrink-0">
                  {interest.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base mb-1">
                    {interest.label}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">
                    {interest.desc}
                  </p>
                </div>
                {selectedInterests.includes(interest.id) && (
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <FormProvider {...methods}>
      <form
        className={cn("flex flex-col gap-6 w-full", className)}
        onSubmit={handleSubmit(onSubmit)}
        {...props}
      >
        {renderProgressBar()}

        <div className="min-h-[450px] sm:min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="flex gap-3 mt-6">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex-1"
            >
              ← Back
            </Button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={nextStep} className="flex-1">
              Next Step →
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValue("interests", []);
                  setSelectedInterests([]);
                  handleSubmit(onSubmit)();
                }}
                className="flex-1"
              >
                Skip This
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? "Creating..." : "Create Account"}
              </Button>
            </>
          )}
        </div>

        {currentStep === 1 && (
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
