import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Report = () => {
  const { currentUser, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Don't fetch if auth is still loading or no user
    if (loading || !currentUser?.userId) {
      setCourses([]); // Clear previous data
      return;
    }

    setIsLoading(true);
    
    axios.get(`http://localhost:8080/api/dashboard/courses/grouped?userId=${currentUser.userId}`)
      .then((res) => {
        setCourses(res.data.courses || []);
      })
      .catch((err) => {
        console.error("Report: Fetch error:", err);
        setCourses([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentUser?.userId, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Academic Report</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading user data...</span>
        </div>
      </div>
    );
  }

  // Show no user state
  if (!currentUser?.userId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Academic Report</h1>
        <p className="text-gray-500">Please log in to view your reports.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Academic Report</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading courses...</span>
        </div>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        courses.map((course, ci) => (
          <div key={ci} className="mb-6 border rounded-lg shadow-md">
            <div className="bg-gray-200 p-3 font-semibold">
              {course.courseName} ({course.semester} - {course.academicYear})
            </div>

            {/* Goals */}
            {course.goals && Object.values(course.goals).length > 0 ? (
              Object.values(course.goals).map((goal, gi) => (
                <div key={gi} className="p-5 border-t">
                  🎯 <span className="font-semibold">{goal.goalTitle}</span>
                  <span className="ml-2 text-sm text-gray-500">[{goal.priority}]</span>

                  {/* Progress Bar */}
                  {goal.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-3 my-2">
                      <div
                        className={`h-3 rounded-full ${
                          goal.progress >= 100
                            ? "bg-green-500"
                            : goal.progress >= 75
                            ? "bg-blue-500"
                            : goal.progress >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Categories */}
                  {goal.categories && Object.values(goal.categories).map((cat, ci2) => (
                    <div key={ci2} className="ml-4 mt-2">
                      <div className="font-medium text-blue-600">{cat.categoryName}</div>
                      <table className="ml-4 mt-1 text-sm border w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-1 px-2 border">Assessment</th>
                            <th className="py-1 px-2 border">Status</th>
                            <th className="py-1 px-2 border">Score</th>
                            <th className="py-1 px-2 border">Items</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.assessments && cat.assessments.length > 0 ? (
                            cat.assessments.map((a, ai) => (
                              <tr key={ai} className="text-center hover:bg-gray-50">
                                <td className="py-1 px-2 border">{a.assessmentName}</td>
                                <td
                                  className={`py-1 px-2 border font-bold ${
                                    a.status === "COMPLETED"
                                      ? "text-green-600"
                                      : a.status === "UPCOMING"
                                      ? "text-blue-600"
                                      : a.status === "OVERDUE"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {a.status}
                                </td>
                                <td className="py-1 px-2 border">
                                  {a.percentageScore != null
                                    ? `${a.percentageScore}%`
                                    : "-"}
                                </td>
                                <td className="py-1 px-2 border">
                                  {a.pointsEarned != null && a.pointsPossible != null
                                    ? `${a.pointsEarned}/${a.pointsPossible}`
                                    : "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-2 text-gray-500">
                                No assessments
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="p-3 text-gray-500">No goals found.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Report;
