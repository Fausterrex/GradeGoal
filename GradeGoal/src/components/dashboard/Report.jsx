import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { useAuth } from "../context/AuthContext";
import { useYearLevel } from "../context/YearLevelContext";
import logo from "../../drawables/logoGG.png"
const Report = () => {
  const { currentUser, loading } = useAuth();
  const { selectedYearLevel, filterDataByYearLevel } = useYearLevel();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resData, setResData] = useState(null);
  const reportRef = useRef(null); // 🔹 Reference to the report content\


  const handleExportToPDF = async () => {
    if (!reportRef.current || !currentUser?.userId) return;

    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 🕒 timestamps
      const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const completedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // 📦 export parameters
      const exportParams = {
        yearLevel: selectedYearLevel || "Not specified",
        createdAt,
        completedAt,
        expiresAt,
      };

      // 🧾 Header (logo + title)
      const img = new Image();
      img.src = logo;
      await new Promise((resolve) => (img.onload = resolve));


      const headerHeight = 25;
      const drawHeader = () => {
        pdf.addImage(img, "PNG", 10, 5, 20, 20);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("GradeGoal Academic Report", pageWidth / 2, 20, { align: "center" });
      };

      // 🦶 Footer (timestamps + year level)
      const addFooter = (pageNum, totalPages) => {
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(`Year Level: ${exportParams.yearLevel}`, 10, pageHeight - 25);
        pdf.text(`Created at: ${exportParams.createdAt}`, 10, pageHeight - 20);
        pdf.text(`Completed at: ${exportParams.completedAt}`, 10, pageHeight - 15);
        pdf.text(`Expires at: ${exportParams.expiresAt}`, 10, pageHeight - 10);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 25, pageHeight - 10);
      };

      // 🧾 Add content
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = headerHeight + 10;

      drawHeader();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - headerHeight;

      let pageNum = 1;
      while (heightLeft > 0) {
        pdf.addPage();
        pageNum++;
        drawHeader();
        pdf.addImage(imgData, "PNG", 10, position - imgHeight + heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight - headerHeight;
      }

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addFooter(i, totalPages);
      }

      const fileName = `GradeGoal_Report_${Date.now()}.pdf`;
      const fileData = pdf.output("datauristring");

      pdf.save(fileName);

      // 🧠 Debug payload
      const payload = {
        userId: currentUser.userId,
        exportType: "PDF_REPORT",
        fileName,
        filePath: `/exports/${fileName}`,
        fileData,
        exportParameters: JSON.stringify(exportParams), // ✅ stringify
        createdAt,
        completedAt,
        expiresAt,
      };
      console.log("📦 Export payload:", payload);

      // 🔥 Send to backend
      await axios.post("http://localhost:8080/api/exports/log", payload);

      alert("✅ Report exported and logged successfully!");
    } catch (error) {
      console.error("❌ PDF export failed:", error);
      alert(`PDF export failed: ${error.message}`);
    }
  };



  useEffect(() => {
    // Don't fetch if auth is still loading or no user
    if (loading || !currentUser?.userId) {
      setCourses([]); // Clear previous data
      return;
    }

    setIsLoading(true);

    axios.get(`http://localhost:8080/api/dashboard/courses/grouped?userId=${currentUser.userId}`)
      .then((res) => {
        const allCourses = res.data.courses || [];
        setResData(res.data); // ✅ add this line near the top

        // Debug: Log the structure of the first course to understand the data format
        if (allCourses.length > 0) {
          console.log('🎓 [Report] First course structure:', allCourses[0]);
          console.log('🎓 [Report] Course fields:', Object.keys(allCourses[0]));
        }

        const filteredCourses = filterDataByYearLevel(allCourses, 'creationYearLevel');

        // If filtering returns 0 courses but we have courses, it means the year level field is missing
        // In this case, show all courses for now (or we could add a different filtering logic)
        const finalCourses = filteredCourses.length === 0 && allCourses.length > 0 ? allCourses : filteredCourses;

        console.log('🎓 [Report] Filtering courses by year level:', {
          totalCourses: allCourses.length,
          filteredCourses: filteredCourses.length,
          finalCourses: finalCourses.length,
          selectedYearLevel: selectedYearLevel,
          firstCourseYearLevel: allCourses[0]?.creationYearLevel || 'undefined',
          usingFallback: filteredCourses.length === 0 && allCourses.length > 0
        });

        setCourses(finalCourses);
      })
      .catch((err) => {
        console.error("Report: Fetch error:", err);
        setCourses([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentUser?.userId, loading]);

  // Reload courses when year level changes
  useEffect(() => {
    if (currentUser?.userId && !loading) {
      console.log('🎓 [Report] Year level changed, reloading reports data');
      setIsLoading(true);

      axios.get(`http://localhost:8080/api/dashboard/courses/grouped?userId=${currentUser.userId}`)
        .then((res) => {
          const allCourses = res.data.courses || [];

          // Debug: Log the structure of the first course to understand the data format
          if (allCourses.length > 0) {
            console.log('🎓 [Report] Year level change - First course structure:', allCourses[0]);
            console.log('🎓 [Report] Year level change - Course fields:', Object.keys(allCourses[0]));
          }

          const filteredCourses = filterDataByYearLevel(allCourses, 'creationYearLevel');

          // If filtering returns 0 courses but we have courses, it means the year level field is missing
          // In this case, show all courses for now (or we could add a different filtering logic)
          const finalCourses = filteredCourses.length === 0 && allCourses.length > 0 ? allCourses : filteredCourses;

          console.log('🎓 [Report] Year level change - filtering courses:', {
            totalCourses: allCourses.length,
            filteredCourses: filteredCourses.length,
            finalCourses: finalCourses.length,
            selectedYearLevel: selectedYearLevel,
            firstCourseYearLevel: allCourses[0]?.creationYearLevel || 'undefined',
            usingFallback: filteredCourses.length === 0 && allCourses.length > 0
          });

          setCourses(finalCourses);
        })
        .catch((err) => {
          console.error("Report: Year level change fetch error:", err);
          setCourses([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [filterDataByYearLevel]); // This will depend on selectedYearLevel indirectly

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
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📊 Academic Report</h1>
        <button
          onClick={handleExportToPDF} // ✅ now no args needed
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          Export to PDF
        </button>
      </div>


      {/* Report content to be exported */}
      <div ref={reportRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading courses...</span>
          </div>
        ) : (
          <div className="p-6">
            {/* 🧑 User Info Header */}
            {/* 🧑 User Info Header */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-indigo-700 mb-2">User Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-700">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {resData?.name || currentUser?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Level:</span>{" "}
                  {courses[0]?.level || "N/A"}
                </div>
                <div>
                  <span className="font-medium">School Year:</span>{" "}
                  {courses[0]?.academicYear || "N/A"}
                </div>
              </div>

            </div>

            {/* 🧾 Course list */}
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
                  <div className="bg-gray-200 p-3 font-semibold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      {course.courseName} ({course.semester} - {course.academicYear})
                    </div>

                    {/* 🧮 GPA Info */}
                    <div className="text-sm font-normal text-gray-700 mt-2 sm:mt-0">
                      <span className="mr-4">
                        <span className="font-medium">Current GPA:</span>{" "}
                        {course.currentGpa != null ? Number(course.currentGpa).toFixed(2) : "N/A"}
                      </span>
                      <span>
                        <span className="font-medium">Target GPA:</span>{" "}
                        {Object.values(course.goals || {})[0]?.targetGoal ?? "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* 🎯 Goals Section */}
                  {course.goals && Object.values(course.goals).length > 0 ? (
                    Object.values(course.goals).map((goal, gi) => (
                      <div key={gi} className="p-5 border-t">
                        🎯 <span className="font-semibold">{goal.goalTitle}</span>
                        <span className="ml-2 text-sm text-gray-500">[{goal.priority}]</span>

                        {/* Progress Bar */}
                        {goal.progress && (
                          <div className="w-full bg-gray-200 rounded-full h-3 my-2">
                            <div
                              className={`h-3 rounded-full ${goal.progress >= 100
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
                          <div key={ci2} className="mt-2">
                            <div className="font-medium text-blue-600">{cat.categoryName}</div>
                            <table className="mt-1 text-sm border w-full table-fixed">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="py-1 px-2 border w-1/4">Assessment</th>
                                  <th className="py-1 px-2 border w-1/4">Status</th>
                                  <th className="py-1 px-2 border w-1/4">Score</th>
                                  <th className="py-1 px-2 border w-1/4">Items</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cat.assessments && cat.assessments.length > 0 ? (
                                  cat.assessments.map((a, ai) => (
                                    <tr key={ai} className="text-center hover:bg-gray-50">
                                      <td className="py-1 px-2 border truncate">{a.assessmentName}</td>
                                      <td
                                        className={`py-1 px-2 border font-bold ${a.status === "COMPLETED"
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
                                        {a.percentageScore != null ? `${a.percentageScore}%` : "-"}
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
        )}
      </div>

    </div >
  );

};

export default Report;
