// ========================================
// GOAL SETTING COMPONENT
// ========================================
// This component manages academic goals and targets
// Features: Goal creation, editing, deletion, filtering, priority management

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTimes,
  FaBullseye,
  FaCalendarAlt,
  FaFlag,
  FaBook,
} from "react-icons/fa";
import { getUserProfile } from "../../backend/api";

const GoalSetting = ({ userEmail, courses = [], isCompact = false }) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    goalTitle: "",
    goalType: "COURSE_GRADE",
    targetValue: "",
    courseId: "",
    targetDate: "",
    description: "",
    priority: "MEDIUM",
  });

  // Get user ID when component mounts
  useEffect(() => {
    if (userEmail) {
      console.log("Getting user profile for email:", userEmail);
      getUserProfile(userEmail)
        .then((user) => {
          console.log("User profile received:", user);
          setUserId(user.userId);
          fetchGoals(user.userId);
        })
        .catch((error) => {
          console.error("Error getting user profile:", error);
        });
    }
  }, [userEmail]);

  const fetchGoals = async (userId) => {
    if (!userId) return;

    try {
      setLoading(true);
      console.log("Fetching goals for user ID:", userId);
      const response = await fetch(
        `http://localhost:8080/api/academic-goals/user/${userId}`
      );
      console.log("Goals API response status:", response.status);
      if (response.ok) {
        const goalsData = await response.json();
        console.log("Goals data received:", goalsData);
      setGoals(goalsData);
      } else {
        console.error("Failed to fetch goals, status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if trying to add cumulative GPA goal when one already exists
    if (
      formData.goalType === "CUMMULATIVE_GPA" &&
      hasCumulativeGoal &&
      !isEditing
    ) {
      alert(
        "You can only have one Cumulative GPA goal. Please edit the existing one or delete it first."
      );
      return;
    }

      try {
      setLoading(true);

        const goalData = {
        ...formData,
        targetValue: parseFloat(formData.targetValue),
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        targetDate: formData.targetDate || null,
      };

      const response = await fetch(
        `http://localhost:8080/api/academic-goals/user/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(goalData),
        }
      );

      if (response.ok) {
        const newGoal = await response.json();
        setGoals([...goals, newGoal]);
        resetForm();
      } else {
        console.error("Failed to create goal");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleGoalAchievement = async (goalId, isAchieved) => {
    try {
      const endpoint = isAchieved ? "unachieve" : "achieve";
      const response = await fetch(
        `http://localhost:8080/api/academic-goals/${goalId}/${endpoint}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        fetchGoals(); // Refresh goals
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/academic-goals/${goalId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setGoals(goals.filter((goal) => goal.goalId !== goalId));
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const editGoal = (goal) => {
    setFormData({
      goalTitle: goal.goalTitle,
      goalType: goal.goalType,
      targetValue: goal.targetValue.toString(),
      courseId: goal.courseId ? goal.courseId.toString() : "",
      targetDate: goal.targetDate || "",
      description: goal.description || "",
      priority: goal.priority,
    });
    setEditingGoalId(goal.goalId);
    setIsEditing(true);
    setIsOpen(true);
  };

  const updateGoal = async (e) => {
    e.preventDefault();
    if (!userId || !editingGoalId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/academic-goals/${editingGoalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goalTitle: formData.goalTitle,
            goalType: formData.goalType,
            targetValue: parseFloat(formData.targetValue),
            courseId: formData.courseId ? parseInt(formData.courseId) : null,
            targetDate: formData.targetDate || null,
            description: formData.description || null,
            priority: formData.priority,
          }),
        }
      );

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(
          goals.map((goal) =>
            goal.goalId === editingGoalId ? updatedGoal : goal
          )
        );
        resetForm();
      }
      } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      goalTitle: "",
      goalType: "COURSE_GRADE",
      targetValue: "",
      courseId: "",
      targetDate: "",
      description: "",
      priority: "MEDIUM",
    });
    setIsOpen(false);
    setIsEditing(false);
    setEditingGoalId(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "text-red-700 bg-red-200";
      case "MEDIUM":
        return "text-yellow-700 bg-yellow-200";
      case "LOW":
        return "text-green-700 bg-green-200";
      default:
        return "text-gray-700 bg-gray-200";
    }
  };

  const getGoalTypeIcon = (goalType) => {
    switch (goalType) {
      case "COURSE_GRADE":
        return <FaBook className="text-blue-600" />;
      case "SEMESTER_GPA":
        return <FaBullseye className="text-purple-600" />;
      case "CUMMULATIVE_GPA":
        return <FaFlag className="text-orange-600" />;
      default:
        return <FaBullseye className="text-gray-600" />;
    }
  };

  // Filter and sort goals
  const getFilteredAndSortedGoals = () => {
    let filteredGoals = goals;

    // Apply filter
    if (activeFilter !== "ALL") {
      filteredGoals = goals.filter((goal) => goal.goalType === activeFilter);
    }

    // Sort goals: Cumulative GPA first, then by type, then by priority
    return filteredGoals.sort((a, b) => {
      // Cumulative GPA goals always first
      if (a.goalType === "CUMMULATIVE_GPA" && b.goalType !== "CUMMULATIVE_GPA")
        return -1;
      if (b.goalType === "CUMMULATIVE_GPA" && a.goalType !== "CUMMULATIVE_GPA")
        return 1;

      // Then by type
      const typeOrder = {
        CUMMULATIVE_GPA: 0,
        SEMESTER_GPA: 1,
        COURSE_GRADE: 2,
      };
      if (typeOrder[a.goalType] !== typeOrder[b.goalType]) {
        return typeOrder[a.goalType] - typeOrder[b.goalType];
      }

      // Then by priority
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Check if cumulative GPA goal already exists
  const hasCumulativeGoal = goals.some(
    (goal) => goal.goalType === "CUMMULATIVE_GPA"
  );

  // Get goal counts for filter buttons
  const getGoalCounts = () => {
    return {
      ALL: goals.length,
      CUMMULATIVE_GPA: goals.filter((g) => g.goalType === "CUMMULATIVE_GPA")
        .length,
      SEMESTER_GPA: goals.filter((g) => g.goalType === "SEMESTER_GPA").length,
      COURSE_GRADE: goals.filter((g) => g.goalType === "COURSE_GRADE").length,
    };
  };

  const goalCounts = getGoalCounts();

  return (
    <div className="w-full h-full min-h-screen p-6">
      {/* ========================================
          MAIN CONTAINER - FULL SCREEN LAYOUT (Tailwind: w-full h-full min-h-screen p-6)
          ======================================== */}
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      {!isCompact && (
        <div className="mb-6">
          {/* ========================================
              HEADER TITLE AND ADD BUTTON (Tailwind: flex items-center justify-between mb-4)
              ======================================== */}
          <div className="flex items-center justify-between mb-4">
            {/* TITLE WITH ICON (Tailwind: text-xl font-bold text-black-200 flex items-center) */}
            <h3 className="text-xl font-bold text-black-200 flex items-center">
              <FaBullseye className="mr-3 text-lg text-[#6D4FC2]" />
              Academic Goals
            </h3>
            {/* ADD GOAL BUTTON (Tailwind: bg-[#6D4FC2] hover:bg-[#5A3FA8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg) */}
        <button
              onClick={() => setIsOpen(true)}
              className="bg-[#6D4FC2] hover:bg-[#5A3FA8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg"
        >
              <FaPlus className="mr-2" />
              Add Goal
        </button>
      </div>

          {/* ========================================
              FILTER BUTTONS SECTION (Tailwind: flex flex-wrap gap-2)
              ======================================== */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                key: "ALL",
                label: "All Goals",
                icon: <FaBullseye />,
                color: "gray",
              },
              {
                key: "CUMMULATIVE_GPA",
                label: "Cumulative GPA",
                icon: <FaFlag />,
                color: "orange",
              },
              {
                key: "SEMESTER_GPA",
                label: "Semester GPA",
                icon: <FaBullseye />,
                color: "purple",
              },
              {
                key: "COURSE_GRADE",
                label: "Course Grade",
                icon: <FaBook />,
                color: "blue",
              },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFilter === filter.key
                    ? `bg-${filter.color}-100 text-${filter.color}-700 border-2 border-${filter.color}-300 shadow-md`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                }`}
              >
                <span className="mr-2">{filter.icon}</span>
                {filter.label}
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeFilter === filter.key
                      ? `bg-${filter.color}-200 text-${filter.color}-800`
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {goalCounts[filter.key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================
          COMPACT MODE ADD BUTTON (Tailwind: flex items-center justify-between mb-3)
          ======================================== */}
      {isCompact && (
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors w-full"
          >
            <FaPlus className="mr-2" />
            Add Goal
          </button>
        </div>
      )}

      {/* ========================================
          GOALS LIST CONTAINER (Tailwind: space-y-4 max-h-40/h-full overflow-y-auto)
          ======================================== */}
      <div
        className={`space-y-4 ${
          isCompact ? "max-h-40" : "h-full"
        } overflow-y-auto`}
      >
        {/* ========================================
            GOALS LIST CONTENT
            ======================================== */}
        {loading && goals.length === 0 ? (
          <div
            className={`text-center text-gray-700 py-6 ${
              isCompact ? "text-base" : "text-lg"
            } font-medium`}
          >
            {/* ========================================
                LOADING STATE
                ======================================== */}
            Loading goals...
          </div>
        ) : getFilteredAndSortedGoals().length === 0 ? (
          <div
            className={`text-center text-gray-700 py-6 ${
              isCompact ? "text-base" : "text-lg"
            } font-medium`}
          >
            {/* ========================================
                EMPTY STATE
                ======================================== */}
            {activeFilter === "ALL"
              ? "No goals set yet"
              : `No ${activeFilter
                  .toLowerCase()
                  .replace("_", " ")} goals found`}
          </div>
        ) : (
          getFilteredAndSortedGoals()
            .slice(0, isCompact ? 3 : undefined)
            .map((goal) => (
              <div
                key={goal.goalId}
                className={`${
                  isCompact ? "bg-white/90" : "bg-white/95"
                } backdrop-blur-sm rounded-xl ${
                  isCompact ? "p-3" : "p-4"
                } border-l-4 shadow-lg ${
                  goal.isAchieved
                    ? "border-green-500 bg-green-50"
                    : goal.goalType === "CUMMULATIVE_GPA"
                    ? "border-orange-500 bg-orange-50"
                    : goal.goalType === "SEMESTER_GPA"
                    ? "border-purple-500 bg-purple-50"
                    : "border-blue-500 bg-blue-50"
                }`}
              >
                {/* GOAL CARD (Tailwind: bg-white/90-95 backdrop-blur-sm rounded-xl p-3/4 border-l-4 shadow-lg + dynamic colors) */}
                {/* ========================================
                  GOAL CARD CONTENT WRAPPER (Tailwind: flex items-start justify-between)
                  ======================================== */}
                <div className="flex items-start justify-between">
                  {/* ========================================
                    GOAL DETAILS SECTION
                    ======================================== */}
                  <div className="flex-1">
                    {/* ========================================
                      GOAL HEADER (ICON, TITLE, BADGES)
                      ======================================== */}
                    <div className="flex items-center mb-3">
                      {/* ========================================
                        GOAL TYPE ICON
                        ======================================== */}
                      <div className="text-xl">
                        {getGoalTypeIcon(goal.goalType)}
                      </div>
                      {/* ========================================
                        GOAL TITLE
                        ======================================== */}
                      <span
                        className={`ml-3 font-bold text-gray-900 ${
                          isCompact ? "text-base" : "text-lg"
                        }`}
                      >
                        {goal.goalTitle}
                      </span>
                      {/* ========================================
                        PRIMARY BADGE (FOR CUMULATIVE GOALS)
                        ======================================== */}
                      {goal.goalType === "CUMMULATIVE_GPA" && (
                        <span className="ml-2 px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded-full">
                          PRIMARY
                        </span>
                      )}
                      {/* ========================================
                        PRIORITY BADGE
                        ======================================== */}
                      {!isCompact && (
                        <span
                          className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(
                            goal.priority
                          )}`}
                        >
                          {goal.priority}
                        </span>
                      )}
                    </div>

                    {/* ========================================
                      TARGET VALUE DISPLAY
                      ======================================== */}
                    <div
                      className={`text-gray-800 mb-3 ${
                        isCompact ? "text-base" : "text-lg"
                      } font-semibold`}
                    >
                      Target:{" "}
                      <span className="text-gray-900 font-black text-xl">
                        {goal.targetValue}%
                      </span>
                      {/* ========================================
                        COURSE NAME (IF COURSE-SPECIFIC GOAL)
                        ======================================== */}
                      {goal.courseId && !isCompact && (
                        <span className="ml-2 text-gray-700">
                          •{" "}
                          {courses.find((c) => c.courseId === goal.courseId)
                            ?.courseName || "Course"}
                        </span>
                      )}
                    </div>

                    {/* ========================================
                      TARGET DATE DISPLAY
                      ======================================== */}
                    {goal.targetDate && !isCompact && (
                      <div className="text-base text-gray-700 flex items-center mb-3 font-medium">
                        <FaCalendarAlt className="mr-2" />
                        {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* ========================================
                      GOAL DESCRIPTION
                      ======================================== */}
                    {goal.description && !isCompact && (
                      <div className="text-base text-gray-800 mt-3 bg-gray-100 p-3 rounded-lg font-medium">
                        {goal.description}
                      </div>
                    )}
                  </div>

                  {/* ========================================
                    GOAL ACTION BUTTONS
                    ======================================== */}
                  <div className="flex items-center space-x-2 ml-3">
                    {/* ========================================
                      ACHIEVEMENT TOGGLE BUTTON
                      ======================================== */}
                    <button
                      onClick={() =>
                        toggleGoalAchievement(goal.goalId, goal.isAchieved)
                      }
                      className={`${
                        isCompact ? "w-6 h-6" : "w-8 h-8"
                      } rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                        goal.isAchieved
                          ? "bg-green-500 border-green-500 text-white shadow-lg"
                          : "border-gray-400 hover:border-green-500 hover:bg-green-500/20"
                      }`}
                    >
                      {goal.isAchieved && "✓"}
                    </button>
                    {/* ========================================
                      EDIT GOAL BUTTON
                      ======================================== */}
                    {!isCompact && (
                      <button
                        onClick={() => editGoal(goal)}
                        className="w-8 h-8 rounded-full border-2 border-blue-400 hover:border-blue-500 hover:bg-blue-500/20 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-all duration-200"
                        title="Edit goal"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                    {/* ========================================
                      DELETE GOAL BUTTON
                      ======================================== */}
                    {!isCompact && (
                      <button
                        onClick={() => deleteGoal(goal.goalId)}
                        className="text-red-400 hover:text-red-300 text-lg p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* ========================================
          ADD/EDIT GOAL MODAL (Tailwind: fixed inset-0 bg-black/50 flex items-center justify-center z-50)
          ======================================== */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* ========================================
              MODAL CONTENT CONTAINER (Tailwind: bg-white rounded-lg p-6 w-full max-w-md mx-4)
              ======================================== */}
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* ========================================
                MODAL HEADER
                ======================================== */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {isEditing ? "Edit Goal" : "Add New Goal"}
              </h3>
              {/* ========================================
                  CLOSE MODAL BUTTON
                  ======================================== */}
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* ========================================
                    GOAL FORM CONTAINER
                    ======================================== */}
            <form
              onSubmit={isEditing ? updateGoal : handleSubmit}
              className="space-y-4"
            >
              {/* ========================================
                    GOAL TITLE INPUT FIELD
                    ======================================== */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                  </label>
                  <input
                    type="text"
                  name="goalTitle"
                  value={formData.goalTitle}
                  onChange={handleInputChange}
                    required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D4FC2]"
                  placeholder="e.g., Achieve A in Math 101"
                />
              </div>

              {/* ========================================
                  GOAL TYPE DROPDOWN FIELD
                  ======================================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  name="goalType"
                  value={formData.goalType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D4FC2]"
                >
                  <option value="COURSE_GRADE">Course Grade</option>
                  <option value="SEMESTER_GPA">Semester GPA</option>
                  <option value="CUMMULATIVE_GPA">Cumulative GPA</option>
                </select>
                {formData.goalType === "CUMMULATIVE_GPA" &&
                  hasCumulativeGoal &&
                  !isEditing && (
                    <div className="mt-2 p-3 bg-orange-100 border border-orange-300 rounded-md">
                      <div className="flex items-center">
                        <FaFlag className="text-orange-600 mr-2" />
                        <span className="text-orange-800 text-sm font-medium">
                          You already have a Cumulative GPA goal. Creating
                          another will replace the existing one.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              {/* ========================================
                    TARGET VALUE INPUT FIELD
                    ======================================== */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value (%)
                  </label>
                  <input
                    type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D4FC2]"
                  placeholder="85.5"
                />
              </div>

              {/* ========================================
                  COURSE SELECTION DROPDOWN (CONDITIONAL)
                  ======================================== */}
              {formData.goalType === "COURSE_GRADE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D4FC2]"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ========================================
                  TARGET DATE INPUT FIELD
                  ======================================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D4FC2]"
                  />
                </div>

              {/* ========================================
                  PRIORITY DROPDOWN FIELD
                  ======================================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D4FC2]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              {/* ========================================
                  DESCRIPTION TEXTAREA FIELD
                  ======================================== */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                  </label>
                  <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                    rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D4FC2]"
                  placeholder="Additional details about your goal..."
                  />
              </div>

              {/* ========================================
                  FORM ACTION BUTTONS
                  ======================================== */}
              <div className="flex justify-end space-x-3">
                {/* ========================================
                    CANCEL BUTTON
                    ======================================== */}
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                {/* ========================================
                    SUBMIT BUTTON
                    ======================================== */}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#6D4FC2] text-white rounded-md hover:bg-[#5A3FA8] disabled:opacity-50"
                >
                  {loading
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Goal"
                    : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSetting;
