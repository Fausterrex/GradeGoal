import React, { useState, useMemo } from 'react';
import { 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import GradeService from '../../services/gradeService';
import { getCourseColorScheme } from '../../utils/courseColors';
import { convertPercentageToGPA } from '../../utils/gradeCalculations';

const EnhancedGradeTrends = ({ courses, grades, overallGPA }) => {
  const [timeRange, setTimeRange] = useState('12weeks'); // 4weeks, 12weeks, semester
  const [viewMode, setViewMode] = useState('overall'); // overall, individual, comparison
  const [selectedCourse, setSelectedCourse] = useState(null);


  // Generate weekly grade data - simplified for now, will be replaced with database
  const weeklyData = useMemo(() => {
    if (courses.length === 0) return [];

    const activeCourses = courses.filter(course => course.isActive !== false);
    if (activeCourses.length === 0) return [];

    const weeks = timeRange === '4weeks' ? 4 : timeRange === '12weeks' ? 12 : 16;
    const weeklyData = [];
    
    // Calculate current GPA
    let currentGPA = 0;
    if (selectedCourse) {
      if (grades && typeof grades === 'object') {
        try {
          const gradeResult = GradeService.calculateCourseGrade(selectedCourse, grades);
          if (gradeResult.success) {
            let courseGrade = gradeResult.courseGrade;
            if (courseGrade > 4.0) {
              courseGrade = GradeService.convertPercentageToGPA(courseGrade, selectedCourse.gpaScale || '4.0');
            }
            if (courseGrade >= 1.0 && courseGrade <= 4.0) {
              currentGPA = courseGrade;
            }
          }
        } catch (error) {
          currentGPA = 0;
        }
      }
    } else {
      currentGPA = overallGPA || 0;
    }
    
    // Create flat line data for all weeks (will be replaced with database data)
    for (let i = 0; i < weeks; i++) {
      const weekNumber = i + 1;
      
      const weekData = {
        week: `W${weekNumber}`,
        date: new Date().toISOString().split('T')[0],
        overallGPA: currentGPA,
        individualGPA: currentGPA,
        gradeChange: 0,
        individualGrades: {},
        [selectedCourse ? selectedCourse.name : 'overallGPA']: currentGPA
      };
      
      weeklyData.push(weekData);
    }
    
    return weeklyData;
  }, [courses, grades, timeRange, selectedCourse, overallGPA]);

  // Calculate current GPA for display
  const currentDisplayGPA = useMemo(() => {
    if (selectedCourse) {
      // For individual course, calculate the course's current GPA using the same logic as GradeEntry
      if (!grades) {
        return 0;
      }
      
      
      // Use the same calculation logic as Dashboard component
      try {
        const gradeResult = GradeService.calculateCourseGrade(selectedCourse, grades);
        if (gradeResult.success) {
          let courseGrade = gradeResult.courseGrade;
          // Always convert to GPA if the grade is greater than 4.0 (indicating it's a percentage)
          if (courseGrade > 4.0) {
            courseGrade = GradeService.convertPercentageToGPA(courseGrade, selectedCourse.gpaScale || '4.0');
          }
          if (courseGrade >= 1.0 && courseGrade <= 4.0) {
            return courseGrade;
          }
        }
        return 0;
      } catch (error) {
        return 0;
      }
    } else {
      // For overall view, calculate weighted average of all courses
      if (!grades || !Array.isArray(grades) || !courses || !Array.isArray(courses)) return overallGPA || 0;
      
      const activeCourses = courses.filter(course => course.isActive !== false);
      if (activeCourses.length === 0) return overallGPA || 0;
      
      let totalWeightedGPA = 0;
      let totalWeight = 0;
      
      activeCourses.forEach(course => {
        const courseGrades = grades.filter(grade => grade.courseId === course.id);
        if (courseGrades.length > 0) {
          const courseGpaScale = course.gpaScale || '4.0';
          const courseTotalGPA = courseGrades.reduce((sum, grade) => {
            const points = parseFloat(grade.points) || 0;
            const maxPoints = parseFloat(grade.maxPoints) || 100;
            const percentage = (points / maxPoints) * 100;
            const gpa = convertPercentageToGPA(percentage, courseGpaScale);
            return sum + gpa;
          }, 0);
          
          const courseAverageGPA = courseTotalGPA / courseGrades.length;
          const courseWeight = courseGrades.length; // Weight by number of grades
          
          totalWeightedGPA += courseAverageGPA * courseWeight;
          totalWeight += courseWeight;
        }
      });
      
      return totalWeight > 0 ? totalWeightedGPA / totalWeight : overallGPA || 0;
    }
  }, [selectedCourse, grades, overallGPA, courses]);

  // Calculate target GPA using the same logic as Dashboard
  const targetGPA = useMemo(() => {
    if (selectedCourse) {
      // Course target GPA - convert to GPA if it's a percentage
      if (selectedCourse.targetGrade) {
        const targetValue = parseFloat(selectedCourse.targetGrade);
        if (targetValue > 4.0) {
          // Convert percentage to GPA using course's GPA scale
          return GradeService.convertPercentageToGPA(targetValue, selectedCourse.gpaScale || '4.0');
        } else {
          // Already in GPA format
          return targetValue;
        }
      }
      return 0;
    } else {
      // Semester target GPA (average of all courses) - convert each to GPA first
      const activeCourses = courses.filter(course => course.isActive !== false);
      if (activeCourses.length === 0) return 0;
      
      const totalTarget = activeCourses.reduce((sum, course) => {
        if (course.targetGrade) {
          const targetValue = parseFloat(course.targetGrade);
          if (targetValue > 4.0) {
            // Convert percentage to GPA using course's GPA scale
            return sum + GradeService.convertPercentageToGPA(targetValue, course.gpaScale || '4.0');
          } else {
            // Already in GPA format
            return sum + targetValue;
          }
        }
        return sum;
      }, 0);
      
      return totalTarget / activeCourses.length;
    }
  }, [selectedCourse, courses]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      
      // Show different data based on view mode
      if (selectedCourse) {
        // Individual course view - show course-specific data
        const courseGPA = data[selectedCourse.name] || data.overallGPA || 0;
        return (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600">
            <p className="text-white font-semibold mb-2">{`Week: ${label}`}</p>
            <p className="text-green-400 mb-1">{`${selectedCourse.name} GPA: ${courseGPA.toFixed(2)}`}</p>
            {data.gradeChange !== 0 && (
              <p className={`${data.gradeChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {`Change: ${data.gradeChange > 0 ? '+' : ''}${data.gradeChange.toFixed(2)}`}
              </p>
            )}
          </div>
        );
      } else {
        // Overall view - show overall data
        return (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600">
            <p className="text-white font-semibold mb-2">{`Week: ${label}`}</p>
            <p className="text-green-400 mb-1">{`Overall GPA: ${data.overallGPA.toFixed(2)}`}</p>
            {data.gradeChange !== 0 && (
              <p className={`${data.gradeChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {`Change: ${data.gradeChange > 0 ? '+' : ''}${data.gradeChange.toFixed(2)}`}
              </p>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Grade Trends</h2>
      </div>
      
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('4weeks')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              timeRange === '4weeks' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            4 Weeks
          </button>
          <button
            onClick={() => setTimeRange('12weeks')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              timeRange === '12weeks' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            12 Weeks
          </button>
          <button
            onClick={() => setTimeRange('semester')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              timeRange === 'semester' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            Full Semester
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('overall');
              setSelectedCourse(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              viewMode === 'overall' 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => {
              setViewMode('individual');
              // Auto-select the first active course when switching to individual mode
              const activeCourses = courses.filter(course => course.isActive !== false);
              if (activeCourses.length > 0) {
                setSelectedCourse(activeCourses[0]);
              }
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              viewMode === 'individual' 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            Individual Courses
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-2">
              <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">Current GPA</h3>
            </div>
            <p className="text-4xl font-bold mb-1">{currentDisplayGPA.toFixed(2)}</p>
            <p className="text-sm opacity-80">
              {selectedCourse ? selectedCourse.name : 'Overall average'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-2">
              <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                {selectedCourse ? 'Course Target GPA' : 'Semester Target GPA'}
              </h3>
            </div>
                         <p className="text-4xl font-bold mb-1">
               {targetGPA > 0 ? Math.min(targetGPA, 4.0).toFixed(2) : 'Not Set'}
             </p>
            <p className="text-sm opacity-80">
              {selectedCourse ? selectedCourse.name : 'Average target'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {selectedCourse ? `${selectedCourse.name} Grade Progression` : 'Weekly Grade Progression'}
          </h3>
        </div>
        
        <div className="h-96 bg-white rounded-xl p-4 border border-gray-200">
          {weeklyData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Grade Data Yet</h3>
                <p className="text-gray-500">Add some assessments to see your grade progression</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyData}>
              <defs>
                <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="week" 
                stroke="#6b7280"
                fontSize={14}
                tick={{ fill: '#374151' }}
                fontWeight="500"
              />
              <YAxis 
                domain={[0, 4]} 
                stroke="#6b7280"
                fontSize={14}
                tick={{ fill: '#374151' }}
                tickFormatter={(value) => value.toFixed(1)}
                fontWeight="500"
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              
              {/* Grade area - different for overall vs individual */}
              <Area
                type="monotone"
                dataKey="overallGPA"
                fill="url(#gradeGradient)"
                stroke="none"
              />

              {/* Grade line - different for overall vs individual */}
              <Line
                type="monotone"
                dataKey="overallGPA"
                stroke="#8b5cf6"
                strokeWidth={4}
                                 dot={(props) => {
                   // Show dot at the top of the line (GPA position) - always purple
                   const data = props.payload;
                   if (data && data.overallGPA > 0) {
                     return (
                       <circle
                         key={`dot-${props.index}`}
                         cx={props.cx}
                         cy={props.cy}
                         r={6}
                         fill="#8b5cf6"
                         stroke="#ffffff"
                         strokeWidth={2}
                       />
                     );
                   }
                   return null;
                 }}
                activeDot={{ r: 10, stroke: "#8b5cf6", strokeWidth: 3, fill: "#fff" }}
                name=""
              />
              
              {/* GPA progression line - same for both overall and individual */}
              <Line
                type="monotone"
                dataKey={selectedCourse ? `individualGrades.${selectedCourse.name}` : "newAssessments"}
                stroke="#6D4FC2"
                strokeWidth={2}
                dot={{ fill: "#6D4FC2", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#6D4FC2", strokeWidth: 2 }}
                name=""
              />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Individual Course Trends (if selected) */}
      {viewMode === 'individual' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">Individual Course Trends</h3>
            <p className="text-gray-600 text-sm mt-1">Click on a course to view its detailed progression</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {courses.filter(course => course.isActive !== false).length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📚</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-600 mb-1">No Active Courses</h4>
                <p className="text-gray-500 text-sm">Add some courses to see individual trends</p>
              </div>
            ) : (
              courses.filter(course => course.isActive !== false).map(course => {
              const courseColorScheme = getCourseColorScheme(course.name, course.colorIndex);
              // Convert Tailwind color classes to hex values
              const colorMap = {
                'bg-green-600': '#16a34a',
                'bg-blue-600': '#2563eb',
                'bg-purple-600': '#9333ea',
                'bg-red-600': '#dc2626',
                'bg-teal-600': '#0d9488',
                'bg-indigo-600': '#4f46e5',
                'bg-pink-600': '#db2777',
                'bg-orange-600': '#ea580c',
                'bg-cyan-600': '#0891b2',
                'bg-emerald-600': '#059669'
              };
              const strokeColor = colorMap[courseColorScheme.primary] || '#8168C5';
              
              const isSelected = selectedCourse && selectedCourse.id === course.id;
              
              return (
                <div 
                  key={course.id} 
                  className={`bg-gradient-to-br from-gray-50 to-gray-100 border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                    isSelected ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCourse(isSelected ? null : course)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: strokeColor }}
                      ></div>
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{course.name}</h4>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGradeTrends;
