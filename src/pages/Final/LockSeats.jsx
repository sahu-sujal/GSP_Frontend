import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useCourseSelection from "../../store/useCourseSelection";
import useRegisterStore from "../../store/useRegister";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Lock,
  User,
  Mail,
  Phone,
  Briefcase,
  UserCircle,
  Building2,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import usePayment from "../../store/usePayment";
import { titleCase } from "../../lib/utils";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const OTPInput = ({ value, onChange, disabled }) => {
  // Create refs array properly inside the component
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  const handleChange = (index, inputValue) => {
    const newValue = value.split("");
    newValue[index] = inputValue;
    const combinedValue = newValue.join("");
    onChange(combinedValue);

    // Move to next input if value is entered
    if (inputValue && index < 5) {
      inputRefs.current[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pastedData);

    // Focus the next empty input after paste
    const nextEmptyIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[nextEmptyIndex].current?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          ref={inputRefs.current[index]}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) =>
            handleChange(index, e.target.value.replace(/\D/g, ""))
          }
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-9 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold 
            border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
            focus:outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
        />
      ))}
    </div>
  );
};

const OTPMethodSelector = ({ selected, onChange }) => (
  <div className="flex flex-col space-y-4 mb-6">
    <h3 className="text-sm font-medium text-gray-700">
      Select OTP Delivery Method
    </h3>
    <div className="flex items-center space-x-6">
      <label className="flex items-center space-x-2 cursor-pointer group">
        <div className="relative">
          <input
            type="radio"
            className="hidden"
            checked={selected === "email"}
            onChange={() => onChange("email")}
          />
          <div
            className={`w-5 h-5 border-2 rounded-full ${
              selected === "email"
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300 group-hover:border-blue-400"
            }`}
          >
            {selected === "email" && (
              <div className="absolute inset-1 bg-white rounded-full" />
            )}
          </div>
        </div>
        <span className="text-sm text-gray-700">Email</span>
      </label>

      <label className="flex items-center space-x-2 cursor-pointer group">
        <div className="relative">
          <input
            type="radio"
            className="hidden"
            checked={selected === "phone"}
            onChange={() => onChange("phone")}
          />
          <div
            className={`w-5 h-5 border-2 rounded-full ${
              selected === "phone"
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300 group-hover:border-blue-400"
            }`}
          >
            {selected === "phone" && (
              <div className="absolute inset-1 bg-white rounded-full" />
            )}
          </div>
        </div>
        <span className="text-sm text-gray-700">Phone</span>
      </label>
    </div>
  </div>
);

const FormField = ({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative group">
      <Icon
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          error && touched
            ? "text-red-500"
            : "text-gray-400 group-hover:text-blue-500"
        } transition-colors h-4 w-4`}
      />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`pl-8 w-full py-2 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all
          ${
            error && touched
              ? "border-red-300 focus:ring-red-500 focus:border-transparent bg-red-50"
              : touched && !error
              ? "border-green-300 focus:ring-green-500 focus:border-transparent bg-green-50"
              : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
          }`}
        required
      />
      {touched && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          {error ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </motion.div>
      )}
      {error && touched && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute text-xs text-red-500 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  </div>
);

const CourseTable = ({ selections }) => (
  <div className="mt-4 sm:mt-6 overflow-hidden rounded-xl border border-gray-200">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course Details
            </th>
            <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Institute
            </th>
            <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seats
            </th>
            <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price/Seat
            </th>
            <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(selections).map(([id, course]) => (
            <tr key={id} className="hover:bg-gray-50">
              <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    {course.courseName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {titleCase(course.branch)}
                  </div>
                </div>
              </td>
              <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                <div className="text-xs sm:text-sm text-gray-900">
                  {titleCase(course.institute)}
                </div>
              </td>
              <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                <div className="text-xs sm:text-sm text-gray-900">
                  {titleCase(course.city)}
                </div>
              </td>
              <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
                <div className="text-xs sm:text-sm text-gray-900">
                  {course.selectedSeats}
                </div>
              </td>
              <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                <div className="text-xs sm:text-sm text-gray-900">
                  {formatPrice(course.pricePerSeat)}
                </div>
              </td>
              <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                <div className="text-xs sm:text-sm font-medium text-blue-600">
                  {formatPrice(course.totalPrice)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td
              colSpan="5"
              className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 text-right font-medium text-gray-900"
            >
              Total Amount:
            </td>
            <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
              <div className="text-base sm:text-lg font-bold text-blue-600">
                {formatPrice(
                  Object.values(selections).reduce(
                    (total, course) =>
                      total + (parseFloat(course.totalPrice) || 0),
                    0
                  )
                )}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

// Success Modal Component with enhanced animation
const SuccessModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-white/90 backdrop-blur rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl border border-white/20"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          {/* Outer ring animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 0.8, 1],
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              times: [0, 0.7, 1],
            }}
            className="absolute inset-0 w-16 h-16 rounded-full bg-green-500/10"
          />

          {/* Inner circle with check icon */}
          <motion.div className="relative w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeInOut",
                opacity: { duration: 0.2 },
              }}
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
          </motion.div>

          {/* Glowing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0 w-16 h-16 rounded-full bg-green-500/20 blur-xl"
          />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900"
        >
          Thank You!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600"
        >
          Your contribution will help shape the future of education.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg
            hover:from-blue-600 hover:to-blue-700 transition-all duration-200 
            flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
        >
          <span>Continue</span>
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

const LockSeats = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [otpMethod, setOtpMethod] = useState("email");

  const selectedCourses = useCourseSelection((state) => state.selectedCourses);
  const reset = useCourseSelection((state) => state.reset);
  const { setUserDetails, sendOTP, verifyOTP, otpSent, loading } =
    useRegisterStore();
  const { generateAndDownloadPDF } = usePayment((state) => state);

  useEffect(() => {
    if (Object.keys(selectedCourses).length === 0) {
      toast.error("Please select courses before proceeding");
      navigate("/cart");
    }
  }, [selectedCourses, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        return !value.trim()
          ? "Name is required"
          : value.length < 3
          ? "Name must be at least 3 characters"
          : "";
      case "designation":
        return !value.trim() ? "Designation is required" : "";
      case "email":
        return !value.trim()
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Invalid email address"
          : "";
      case "phone":
        return !value.trim()
          ? "Phone number is required"
          : !/^\d{10}$/.test(value.replace(/\D/g, ""))
          ? "Invalid phone number (10 digits required)"
          : "";
      case "company":
        return !value.trim() ? "Company name is required" : "";
      case "industry":
        return !value.trim() ? "Industry is required" : "";
      default:
        return "";
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    const error = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: error }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const error = validateField(key, formData[key]);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const isFormValid = () => {
    const newErrors = {};
    let isValid = true;
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return isValid;
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const requiredField = otpMethod === "email" ? "email" : "phone";
    if (!formData[requiredField]) {
      toast.error(
        `${
          requiredField === "email" ? "Email" : "Phone number"
        } is required for OTP verification`
      );
      return;
    }

    setIsProcessing(true);
    setUserDetails(formData);

    const userData = {
      ...formData,
      selectedCourses,
      totalPrice: Object.values(selectedCourses).reduce(
        (total, course) => total + (parseFloat(course.totalPrice) || 0),
        0
      ),
      otpMethod, // Make sure otpMethod is included
    };

    const success = await sendOTP(userData);
    if (success) {
      toast.success(
        `OTP sent to your ${otpMethod === "email" ? "email" : "phone number"}!`
      );
    }
    setIsProcessing(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Verifying OTP...");

    const success = await verifyOTP({
      otp,
      email: formData.email,
      phone: formData.phone,
      otpMethod, // Include otpMethod in verification
      user_id: formData.userId,
    });

    if (success) {
      toast.dismiss(loadingToast);
      const summaryToastId = toast.loading(
        "Preparing your adoption summary..."
      );

      try {
        // Prepare selected courses with all required details
        const formattedCourses = {};
        Object.entries(selectedCourses).forEach(([id, course]) => {
          formattedCourses[id] = {
            ...course,
            totalPrice: parseFloat(course.totalPrice),
            pricePerSeat: parseFloat(course.pricePerSeat),
            institute: course.institute || "",
            city: course.city || "",
            branch: course.branch || "",
            courseName: course.courseName || "",
          };
        });

        await generateAndDownloadPDF(
          {
            ...formData,
            industry: formData.industry || "",
          },
          formattedCourses
        );

        toast.dismiss(summaryToastId);
        toast.success("Adoption summary downloaded successfully!");
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.dismiss(summaryToastId);
        toast.error("Failed to generate PDF. Please try again.");
      }
    }

    setIsProcessing(false);
  };

  const handleCloseSuccessModal = () => {
    toast.success("Thank you for your contribution!");
    reset();
    navigate("/");
  };

  const handleBack = () => navigate("/cart");

  const formFields = [
    {
      icon: User,
      label: "Full Name",
      type: "text",
      key: "fullName",
      placeholder: "Enter your full name",
    },
    {
      icon: UserCircle,
      label: "Designation",
      type: "text",
      key: "designation",
      placeholder: "Enter your designation",
    },
    {
      icon: Briefcase,
      label: "Company Name",
      type: "text",
      key: "company",
      placeholder: "Enter your company name",
    },
    {
      icon: Building2, // Added Lucide icon for industry
      label: "Industry",
      type: "text",
      key: "industry",
      placeholder: "Enter your industry",
    },
    {
      icon: Mail,
      label: "Email Address",
      type: "email",
      key: "email",
      placeholder: "Enter your email",
    },
    {
      icon: Phone,
      label: "Phone Number",
      type: "tel",
      key: "phone",
      placeholder: "Enter phone number",
    },
  ];

  if (Object.keys(selectedCourses).length === 0) {
    return (
      <div className="min-h-screen w-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded flex flex-col space-y-4">
            <div className="flex items-center">
              <AlertCircle className="text-orange-400 mr-3" />
              <p className="text-orange-700">
                No courses selected. Please select courses before proceeding.
              </p>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center text-orange-600 hover:text-orange-700"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Course Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Your Adoption Details
            </h1>
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 flex items-center text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>
          </div>

          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:mx-0">
              <div className="inline-block min-w-full align-middle">
                <CourseTable selections={selectedCourses} />
              </div>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSubmitDetails} className="space-y-6">
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Enter Your Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    Please fill in your information to proceed with seat
                    adoption
                  </p>
                </div>

                <OTPMethodSelector
                  selected={otpMethod}
                  onChange={setOtpMethod}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.map((field) => (
                    <FormField
                      key={field.key}
                      icon={field.icon}
                      label={field.label}
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(value) => handleFieldChange(field.key, value)}
                      onBlur={() => handleBlur(field.key)}
                      placeholder={field.placeholder}
                      error={errors[field.key]}
                      touched={touched[field.key]}
                    />
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || isProcessing}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                      disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading || isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Generating OTP...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Generate OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lock className="text-blue-500" size={20} />
                    <h3 className="text-lg font-semibold">Verify Your Email</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enter the OTP sent to {formData.email}
                    </p>
                    <div className="flex flex-col items-center space-y-4">
                      <OTPInput
                        value={otp}
                        onChange={setOtp}
                        disabled={loading}
                      />
                      <button
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.length !== 6}
                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                          disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Verifying OTP...</span>
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            <span>Verify OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={() => {
                          // Prepare full data for resend
                          const resendData = {
                            ...formData,
                            selectedCourses,
                            totalPrice: Object.values(selectedCourses).reduce(
                              (total, course) =>
                                total + (parseFloat(course.totalPrice) || 0),
                              0
                            ),
                            isResend: true,
                            otpMethod,
                          };
                          sendOTP(resendData);
                        }}
                        disabled={loading}
                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center justify-center gap-2 mx-auto"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={14} />
                            <span>Resending OTP...</span>
                          </>
                        ) : (
                          <>
                            <Mail size={14} />
                            <span>Resend OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSuccessModal && <SuccessModal onClose={handleCloseSuccessModal} />}
      </AnimatePresence>
    </div>
  );
};

export default LockSeats;
