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
  const reportRef = useRef(null); 


  const handleExportToPDF = async () => {
    if (!reportRef.current || !currentUser?.userId) {
      alert("Report not ready or user not found.");
      return;
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 25;
      const footerHeight = 20;
      const usableHeight = pageHeight - headerHeight - footerHeight; // 👈 space before footer

      const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const completedAt = createdAt;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const exportParams = {
        yearLevel: selectedYearLevel || "Not specified",
        createdAt,
        completedAt,
        expiresAt,
      };

      const logoImg = new Image();
      logoImg.src = logo;
      await new Promise((resolve) => (logoImg.onload = resolve));

      const drawHeader = (pdfInstance) => {
        const logoX = 10;
        const logoY = 5;
        const logoW = 15;
        const logoH = 15;

        pdfInstance.addImage(logoImg, "PNG", logoX, logoY, logoW, logoH);

        pdfInstance.setFont("helvetica", "bold");
        pdfInstance.setFontSize(15);

        const textY = logoY + logoH / 2 + 1;

        pdfInstance.text("GradeGoal Academic Report", pageWidth / 2, textY, { align: "center" });
      };

      const drawFooter = (pdfInstance, pageNum, totalPages) => {
        pdfInstance.setFontSize(7);
        pdfInstance.setTextColor(100);
        const y = pageHeight - 8;

        pdfInstance.text(`Year Level: ${exportParams.yearLevel}`, 10, y - 8);
        pdfInstance.text(`Created: ${exportParams.createdAt}`, 10, y - 4);
        pdfInstance.text(`Expires At: ${exportParams.expiresAt}`, 10, y);

        pdfInstance.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 25, y);
      };

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: document.documentElement.scrollWidth,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pxPerMm = canvas.height / imgHeight;
      const sliceHeightPx = usableHeight * pxPerMm;

      let yOffsetPx = 0;
      let pageNum = 1;
      const totalSlices = Math.ceil(canvas.height / sliceHeightPx);

      for (let i = 0; i < totalSlices; i++) {
        if (i !== 0) pdf.addPage();
        drawHeader(pdf);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - yOffsetPx);

        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          yOffsetPx,
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        );

        const sliceImgData = sliceCanvas.toDataURL("image/png");
        const sliceImgHeight = sliceCanvas.height / pxPerMm;

        pdf.addImage(sliceImgData, "PNG", margin, headerHeight, imgWidth, sliceImgHeight);

        yOffsetPx += sliceHeightPx;
        pageNum++;
      }


      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        drawFooter(pdf, i, totalPages);
      }

      const fileName = `GradeGoal_Report_${Date.now()}.pdf`;
      pdf.save(fileName);

      // Optional logging
      await axios.post("http://localhost:8080/api/exports/log", {
        userId: currentUser.userId,
        exportType: "PDF_REPORT",
        fileName,
        filePath: `/exports/${fileName}`,
        exportParameters: JSON.stringify(exportParams),
        createdAt,
        completedAt,
        expiresAt,
      });

      alert("✅ Report exported and logged successfully!");
    } catch (error) {
      console.error("❌ PDF export failed:", error);
      alert(`PDF export failed: ${error.message}`);
    }
  };



  useEffect(() => {
    if (loading || !currentUser?.userId) {
      setCourses([]); 
      return;
    }

    setIsLoading(true);

    axios.get(`http://localhost:8080/api/dashboard/courses/grouped?userId=${currentUser.userId}`)
      .then((res) => {
        const allCourses = res.data.courses || [];
        setResData(res.data);
        const filteredCourses = filterDataByYearLevel(allCourses, 'creationYearLevel');
        const finalCourses = filteredCourses.length === 0 && allCourses.length > 0 ? allCourses : filteredCourses;


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

  useEffect(() => {
    if (currentUser?.userId && !loading) {
      setIsLoading(true);

      axios.get(`http://localhost:8080/api/dashboard/courses/grouped?userId=${currentUser.userId}`)
        .then((res) => {
          const allCourses = res.data.courses || [];
          const filteredCourses = filterDataByYearLevel(allCourses, 'creationYearLevel');
          const finalCourses = filteredCourses.length === 0 && allCourses.length > 0 ? allCourses : filteredCourses;

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
  }, [filterDataByYearLevel]);

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

  if (!currentUser?.userId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Academic Report</h1>
        <p className="text-gray-500">Please log in to view your reports.</p>
      </div>
    );
  }
  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalGoals: 0,
    totalAchievements: 0,
  });
  const [achievements, setAchievements] = useState([]);

  // Fetch achievements separately
  useEffect(() => {
    if (!currentUser?.userId || loading) return;

    axios
      .get(`http://localhost:8080/api/user-progress/${currentUser.userId}/recent-achievements`)
      .then((res) => {
        setAchievements(res.data || []);
      })
      .catch((err) => {
        console.error("Achievements fetch failed:", err);
        setAchievements([]);
      });
  }, [currentUser?.userId, loading]);

  // Calculate summary from filtered courses data instead of separate API call
  useEffect(() => {
    if (!courses || courses.length === 0) {
      setSummary({
        totalCourses: 0,
        totalGoals: 0,
        totalAchievements: achievements.length,
      });
      return;
    }

    // Calculate counts from the filtered courses data
    let totalGoals = 0;

    courses.forEach(course => {
      // Count goals for this course
      if (course.goals && Object.values(course.goals).length > 0) {
        totalGoals += Object.values(course.goals).length;
      }
    });

    setSummary({
      totalCourses: courses.length,
      totalGoals: totalGoals,
      totalAchievements: achievements.length,
    });
  }, [courses, achievements]);

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📊 Academic Report</h1>
        <button
          onClick={handleExportToPDF} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          Export to PDF
        </button>
      </div>


      <div ref={reportRef} className="pdf-content">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading courses...</span>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-indigo-700 mb-2">User Information</h2>

              {/*User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-700 mb-4">
                <div>
                  <span className="text-lg">Name:{" "}
                    {resData?.name || currentUser?.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-lg">Level:{" "}
                    {courses[0]?.level || "N/A"}</span>
                </div>
                <div>
                  <span className="text-lg">School Year:{" "}
                    {courses[0]?.academicYear || "N/A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{summary.totalCourses}</p>
                  <p className="text-gray-600 text-sm">Courses</p>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{summary.totalGoals}</p>
                  <p className="text-gray-600 text-sm">Goals</p>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{summary.totalAchievements}</p>
                  <p className="text-gray-600 text-sm">Achievements</p>
                </div>
              </div>
            </div>


            {/* Course list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <p className="text-gray-500">No courses found.</p>
            ) : (
              courses.map((course, ci) => (
                <div key={ci} className="pdf-section mb-6 border rounded-lg shadow-md">
                  <div className="bg-gray-200 p-3 font-semibold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <span className="text-xl"> {course.courseName} ({course.semester} - {course.academicYear})</span>
                    </div>

                    {/* 🧮 GPA Info */}
                    <div className="text-sm font-normal text-gray-700 mt-2 sm:mt-0">
                      <span className="mr-4">
                        <span className="text-xl">Current GPA:</span>{" "}
                        <span className="text-xl">{course.currentGpa != null ? Number(course.currentGpa).toFixed(2) : "N/A"}</span>
                      </span>
                      <span>
                        <span className="text-xl">Target GPA:</span>{" "}
                        <span className="text-xl">{Object.values(course.goals || {})[0]?.targetGoal ?? "N/A"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Goals  */}
                  {course.goals && Object.values(course.goals).length > 0 ? (
                    Object.values(course.goals).map((goal, gi) => (
                      <div key={gi} className="p-5 border-t">
                        🎯 <span className="font-semibold text-xl">{goal.goalTitle}</span>
                        <span className="ml-2 text-sm text-gray-500">[{goal.priority}]</span>

                        {goal.progress && (
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

                        )}

                        {/*  Categories */}
                        {goal.categories &&
                          Object.values(goal.categories).map((cat, ci2) => (
                            <div key={ci2} className="mt-2">
                              <div className="font-medium text-blue-600">{cat.categoryName}</div>
                              <table className="mt-1 text-lg border w-full table-fixed">
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
                    <div className="p-5 border-t">
                      {course.categories && Object.values(course.categories).length > 0 ? (
                        Object.values(course.categories).map((cat, ci2) => (
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
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No assessment data available.</p>
                      )}
                    </div>
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
