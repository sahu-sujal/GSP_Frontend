import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import {
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Building2,
} from "lucide-react";
import useCourseSelection from "../../store/useCourseSelection";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import UnsavedChangesDialog from "../../components/UnsavedDialog";

const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const LoadingState = () => (
  <div className="max-w-5xl mx-auto p-8">
    <div className="animate-pulse space-y-6">
      <div className="h-[600px] bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const CourseStep = ({ course, seats, onSeatChange, onSelect, isSelected }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg p-2.5 sm:p-3 shadow hover:shadow-md transition-all border border-gray-100 group h-full"
  >
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <motion.label className="relative flex items-center cursor-pointer group pt-0.5">
            <div className="relative">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(course.id, e.target.checked)}
                className="peer sr-only"
                disabled={course.left_seats === 0}
              />
              <div
                className={`w-4 h-4 border-2 rounded-md 
                transition-all duration-200 flex items-center justify-center
                group-hover:shadow-sm relative
                ${
                  course.left_seats === 0
                    ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                    : "border-gray-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 group-hover:border-blue-400 peer-checked:group-hover:bg-blue-600"
                }`}
              >
                <motion.div
                  initial={false}
                  animate={isSelected ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.label>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {course.branch}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium truncate">
                {course.course_name}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm sm:text-base font-bold text-blue-600">
            {formatPrice(course.price_per_seat)}
          </div>
          <div className="text-xs text-gray-500">per seat</div>
        </div>
      </div>

      {isSelected && (
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 mt-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <input
                type="number"
                min="1"
                max={course.left_seats}
                value={seats === undefined || seats === null ? "" : String(seats)}
                onChange={(e) => onSeatChange(course.id, e.target.value)}
                className="w-full sm:w-20 p-1 text-sm border-2 border-gray-200 rounded-lg 
                  focus:ring-2 focus:ring-blue-100 focus:border-blue-500 
                  transition-all bg-gray-50 group-hover:bg-white
                  placeholder:text-gray-400 [appearance:textfield] 
                  [&::-webkit-outer-spin-button]:appearance-none 
                  [&::-webkit-inner-spin-button]:appearance-none"
                placeholder={`Max ${course.left_seats}`}
              />
              <span className="absolute right-2 inset-y-0 flex items-center pointer-events-none text-xs text-gray-400">
                seats
              </span>
            </div>
            {seats > 0 && (
              <div className="text-sm font-medium text-blue-600 whitespace-nowrap">
                = {formatPrice(seats * parseFloat(course.price_per_seat))}
              </div>
            )}
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium whitespace-nowrap">
            {course.total_seats - course.left_seats + parseInt(seats || 0)}/
            {course.total_seats} {'Seats Adopted'}
          </span>
        </motion.div>
      )}
    </div>
  </motion.div>
);

const NoCourses = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="col-span-2 p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center"
  >
    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <BookOpen className="w-8 h-8 text-gray-400" />
    </div>
    <p className="text-gray-500 mb-2">No courses available in this city</p>
    <p className="text-sm text-gray-400">Please select another city</p>
  </motion.div>
);

const SelectionSummary = ({ selections, courses }) => {
  const selectedCount = Object.values(selections).filter(
    (s) => s.isSelected
  ).length;

  if (selectedCount === 0) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <h3 className="text-sm font-medium text-blue-800 mb-2">
        Selected Courses Summary:
      </h3>
      <div className="space-y-2">
        {Object.entries(selections)
          .filter(([, value]) => value.isSelected)
          .map(([courseId, value]) => {
            const course = courses.find((c) => c.id === courseId);
            if (!course) return null;
            return (
              <div key={courseId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {course.branch} ({course.course_name})
                </span>
                <span className="text-blue-600 font-medium">
                  {value.seats} seats
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const calculateCityStats = (courses) => {
  return courses.reduce((acc, course) => {
    if (!course.city) return acc;

    if (!acc[course.city]) {
      acc[course.city] = {
        total_seats: 0,
        locked_seats: 0,
        available_seats: 0,
      };
    }

    acc[course.city].total_seats += course.total_seats || 0;
    acc[course.city].available_seats += course.left_seats || 0;
    acc[course.city].locked_seats +=
      course.total_seats - course.left_seats || 0;

    return acc;
  }, {});
};

const ShowCityCourses = () => {
  const { city, courseType } = useParams();
  const {
    courses = [],
    updateSelections,
    fetchCourses,
    isLoading,
    error,
    reset,
  } = useCourseSelection();
  const [localSelections, setLocalSelections] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [attemptedPath, setAttemptedPath] = useState(null);
  const navigate = useNavigate();

  // Reset all selections when component mounts
  useEffect(() => {
    reset(); // Reset global store selections
    setLocalSelections({}); // Reset local selections
    setIsDirty(false); // Reset dirty state
    fetchCourses(); // Fetch fresh courses
  }, [reset, fetchCourses]);

  const cityCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    return courses
      .filter(
        (course) =>
          course.city === city &&
          (courseType ? course.course_name === courseType : true)
      )
      .sort((a, b) => {
        if (courseType) {
          // If courseType is specified, just sort by branch
          return a.branch.localeCompare(b.branch);
        }
        // Otherwise, sort by course_name first, then branch
        const courseNameCompare = a.course_name.localeCompare(b.course_name);
        if (courseNameCompare !== 0) return courseNameCompare;
        return a.branch.localeCompare(b.branch);
      });
  }, [courses, city, courseType]);

  const coursesByInstitute = useMemo(() => {
    if (!Array.isArray(courses)) return {};

    return cityCourses.reduce((acc, course) => {
      const institute = course.institute_name || "Other Institutes"; // Using institute_name instead of institute
      if (!acc[institute]) {
        acc[institute] = [];
      }
      acc[institute].push(course);
      return acc;
    }, {});
  }, [cityCourses, courses]);

  const handleCourseSelect = (courseId, isSelected) => {
    if (courses.find((c) => c.id === courseId)?.left_seats === 0) {
      toast.error("No seats available for this course");
      return;
    }

    setLocalSelections((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        isSelected,
        seats: isSelected ? "1" : "",
        totalPrice: isSelected
          ? parseFloat(
              courses.find((c) => c.id === courseId)?.price_per_seat || 0
            )
          : 0,
      },
    }));
    setIsDirty(true);
  };

  const handleSeatChange = (courseId, seats) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      toast.error("Invalid course selection");
      return;
    }

    const seatCount = parseInt(seats) || 0;
    const pricePerSeat = parseFloat(course.price_per_seat) || 0;

    if (seatCount > course.left_seats) {
      toast.error(`Maximum available seats: ${course.left_seats}`);
      return;
    }

    if (seatCount < 0) {
      toast.error("Number of seats cannot be negative");
      return;
    }

    setLocalSelections((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        seats: seats || "",
        isSelected: seats ? true : prev[courseId]?.isSelected,
        totalPrice: seatCount * pricePerSeat,
      },
    }));
    setIsDirty(true);
  };

  const handleProceed = () => {
    const currentSelections = Object.entries(localSelections)
      .filter(([, value]) => value.isSelected && parseInt(value.seats) > 0)
      .reduce((acc, [courseId, value]) => {
        const course = courses.find((c) => c.id === courseId);
        if (!course || !course.price_per_seat) {
          return acc;
        }

        acc[courseId] = {
          id: courseId,
          selectedSeats: parseInt(value.seats),
          pricePerSeat: parseFloat(course.price_per_seat),
          totalPrice: parseInt(value.seats) * parseFloat(course.price_per_seat),
          branch: course.branch,
          courseName: course.course_name,
          city: course.city,
        };
        return acc;
      }, {});

    if (Object.keys(currentSelections).length === 0) {
      toast.error("Please select at least one course with seats");
      return;
    }

    // Update both selections and selectedCourses in the store
    updateSelections(currentSelections);
    setAttemptedPath("/dashboard/payment");
    useCourseSelection.getState().updateCourseSelection(currentSelections);
    navigate("/dashboard/payment");
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setAttemptedPath(blocker.location.pathname);
      setShowUnsavedDialog(true);
    }
  }, [blocker]);

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false);
    if (attemptedPath) {
      blocker.proceed?.();
      setAttemptedPath(null);
    }
  };

  const cityStats = useMemo(() => calculateCityStats(courses), [courses]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Failed to Load Courses
            </h3>
            <p className="text-gray-500">{error}</p>
            <button
              onClick={() => fetchCourses()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-1 bg-white p-2 sm:p-4 lg:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() =>
                  navigate(
                    courseType
                      ? `/dashboard/new-course-selection/${courseType}`
                      : "/dashboard/courses"
                  )
                }
                className="flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 rounded-lg 
                  bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800
                  border border-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="text-sm sm:text-base">
                  {courseType ? "Back to Cities" : "Back to Courses"}
                </span>
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  {courseType
                    ? `${courseType} Courses in ${city}`
                    : `All Courses in ${city}`}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-0.5 pb-20">
            <SelectionSummary selections={localSelections} courses={courses} />

            {Object.keys(coursesByInstitute).length > 0 ? (
              Object.entries(coursesByInstitute).map(
                ([institute, instituteCourses]) => (
                  <div key={institute} className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        {institute}
                      </h3>
                      <div className="h-px flex-1 bg-gray-100"></div>
                    </div>
                    <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {instituteCourses.map((course) => (
                        <CourseStep
                          key={course.id}
                          course={course}
                          seats={localSelections[course.id]?.seats}
                          onSeatChange={handleSeatChange}
                          onSelect={handleCourseSelect}
                          isSelected={localSelections[course.id]?.isSelected}
                        />
                      ))}
                    </div>
                  </div>
                )
              )
            ) : (
              <NoCourses />
            )}
          </div>

          <div className="fixed sm:absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 bg-white/95 backdrop-blur-sm sm:backdrop-blur-none border-t">
            <div className="flex justify-end items-center gap-4 max-w-full mx-auto">
              <button
                onClick={handleProceed}
                className="flex items-center justify-center h-10 sm:h-11 px-4 sm:px-6 rounded-lg 
                  bg-blue-500/95 backdrop-blur-sm sm:backdrop-blur-none text-white hover:bg-blue-600/95 
                  transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={Object.keys(localSelections).length === 0}
              >
                <span className="text-sm sm:text-base mr-2">Proceed to Lock</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .overflow-y-auto {
            scrollbar-width: thin;
            scrollbar-color: rgba(0,0,0,0.2) transparent;
          }
          .overflow-y-auto::-webkit-scrollbar {
            width: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: transparent;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 4px;
          }
        `}
      </style>

      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onConfirm={handleConfirmNavigation}
        onCancel={() => {
          setShowUnsavedDialog(false);
          blocker.reset?.();
          setAttemptedPath(null);
        }}
        nextPath={attemptedPath}
      />
    </>
  );
};

export default ShowCityCourses;
