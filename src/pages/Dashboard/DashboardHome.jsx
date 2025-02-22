import { useEffect } from "react";
import { Link } from "react-router-dom";
import useDashboard from "../../store/useDashboard";
import { motion } from "framer-motion";
import { User, Users, Mail, GraduationCap } from "lucide-react";

const DashboardHome = () => {
  const { profile, fetchProfile, isLoading } = useDashboard();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <motion.h1
          variants={itemVariants}
          className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-gray-800 border-b pb-4"
        >
          Dashboard Overview
        </motion.h1>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            <motion.div
              variants={itemVariants}
              className="bg-white p-4 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4 text-gray-800">
                  Profile Info
                </h3>
              </div>
              <p className="text-gray-700 font-medium text-lg">
                {profile.full_name}
              </p>
              <p className="text-blue-600 font-medium">{profile.designation}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 lg:p-8 rounded-2xl shadow-lg text-white"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold ml-4">Students</h3>
              </div>
              <p className="text-4xl font-bold mb-2">
                {profile.adopted_students || 0}
              </p>
              <p className="text-blue-100">Total students booked</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-4 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 md:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4 text-gray-800">
                  Contact Info
                </h3>
              </div>
              <p className="text-gray-700 mb-2">{profile.email}</p>
              <p className="text-gray-700 mb-2">{profile.phone_number}</p>
              <p className="text-purple-600 font-medium">
                {profile.company_name}
              </p>
            </motion.div>
          </div>
        )}

        {/* Course Selection Section */}
        <motion.div variants={itemVariants} className="mt-8 lg:mt-12">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800">
            Available Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { name: "M.Tech", color: "yellow" },
              { name: "B.Tech", color: "red" },
              { name: "Diploma", color: "green" },
              { name: "ITI", color: "orange" },
            ].map((course) => {
              const colorConfig = {
                yellow: {
                  bg: "bg-yellow-50",
                  hover: "group-hover:bg-yellow-500",
                  icon: "text-yellow-500",
                  border: "hover:border-yellow-500",
                  button: "text-yellow-600 hover:bg-yellow-500",
                },
                red: {
                  bg: "bg-red-50",
                  hover: "group-hover:bg-red-500",
                  icon: "text-red-500",
                  border: "hover:border-red-500",
                  button: "text-red-600 hover:bg-red-500",
                },
                green: {
                  bg: "bg-green-50",
                  hover: "group-hover:bg-green-500",
                  icon: "text-green-500",
                  border: "hover:border-green-500",
                  button: "text-green-600 hover:bg-green-500",
                },
                orange: {
                  bg: "bg-orange-50",
                  hover: "group-hover:bg-orange-500",
                  icon: "text-orange-500",
                  border: "hover:border-orange-500",
                  button: "text-orange-600 hover:bg-orange-500",
                },
              }[course.color];

              return (
                <motion.div
                  key={course.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  className={`bg-white p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 group ${colorConfig.border} transition-all duration-300`}
                >
                  <div className="mb-4">
                    <div
                      className={`w-12 h-12 ${colorConfig.bg} rounded-xl flex items-center justify-center mb-4 ${colorConfig.hover} transition-colors duration-300`}
                    >
                      <GraduationCap
                        className={`h-6 w-6 ${colorConfig.icon} group-hover:text-white`}
                      />
                    </div>
                    <h3 className="font-semibold text-xl mb-2 text-gray-800">
                      {course.name}
                    </h3>
                  </div>
                  <Link
                    to={`/dashboard/new-course-selection/${course.name}`}
                    className={`mt-2 bg-gray-50 ${colorConfig.button} px-6 py-3 rounded-xl hover:text-white w-full inline-block text-center transition-all duration-300 font-medium`}
                  >
                    Select Branches
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
