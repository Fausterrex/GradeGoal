// ========================================
// STATISTICS COMPONENT
// ========================================
// Displays course statistics cards (GPA, Target Grade, Progress, Assessments)

import React from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function Statistics({ 
  courseGrade, 
  targetGrade, 
  progressPercentage, 
  totalAssessments, 
  course, 
  isCourseArchived 
}) {
  const getTargetGradeDisplay = () => {
    if (targetGrade !== null) {
      return targetGrade.toString();
    }
    return "Not Set";
  };

  return (
    <div
      className={`max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 ${
        isCourseArchived ? "opacity-75" : ""
      }`}
    >
      {/* Current GPA Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-2">
            {courseGrade === 0
              ? "0.00"
              : convertPercentageToGPA(
                  courseGrade,
                  course.gpaScale || "4.0"
                ).toFixed(2)}
          </p>
          <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
            Current GPA
          </p>
        </div>
      </div>

      {/* Target Grade Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-2">
            {getTargetGradeDisplay()}
          </p>
          <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
            Target Grade
          </p>
          <p className="text-xs text-white/60 mt-2">
            Set goals in the Goals tab
          </p>
        </div>
      </div>

      {/* Progress Percentage Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-2">
            {progressPercentage}%
          </p>
          <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
            Progress
          </p>
        </div>
      </div>

      {/* Total Assessments Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-2">
            {totalAssessments}
          </p>
          <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
            Assessments
          </p>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
