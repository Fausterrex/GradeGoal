// ========================================
// UNIFIED PROGRESS COMPONENT
// ========================================
// Consolidated component that combines goal progress, grade progression chart, and trend indicators

import React, { useMemo, useState } from "react";
import { percentageToGPA, gpaToPercentage } from "../../academic_goal/gpaConversionUtils";
import { calculateGPAFromPercentage } from "../../../ai/utils/gradeCalculationUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
function UnifiedProgress({ 
  currentGrade, 
  course, 
  grades, 
  categories,
  colorScheme,
  userAnalytics 
}) {
  // Pagination state for weekly performance cards
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Custom tooltip component matching EnhancedGradeTrends styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const gpaValue = data.currentGPA || 0;
      
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-semibold mb-2">{`Week: ${label || data?.weekNumber || 'N/A'}`}</p>
          <p className="text-green-400 mb-1 text-lg font-bold">
            {`Current GPA: ${gpaValue.toFixed(2)}`}
          </p>
          <p className="text-gray-300 text-sm">
            {`Percentage: ${gpaToPercentage(gpaValue).toFixed(2)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

   // Calculate trajectory data using user analytics (current_grade progression)
   const trajectoryData = useMemo(() => {
     // Use userAnalytics data which contains the current_grade progression
     if (!userAnalytics || userAnalytics.length === 0) {
       return { weekly: [], statistics: {} };
     }

    // Sort analytics by due_date to get chronological progression
    // Add safety check to ensure userAnalytics is an array
    if (!Array.isArray(userAnalytics)) {
      return { weekly: [], statistics: {} };
    }
    
    const sortedAnalytics = [...userAnalytics].sort((a, b) => {
      const dateA = new Date(a.dueDate || a.createdAt);
      const dateB = new Date(b.dueDate || b.createdAt);
      return dateA - dateB;
    });

     // Group by calendar weeks based on due_date
     const weeklyGroups = {};
     
     sortedAnalytics.forEach((analytics, index) => {
       const dueDate = new Date(analytics.dueDate || analytics.createdAt);
       
       if (isNaN(dueDate.getTime())) return; // Skip invalid dates
       
       // Calculate the week start (Monday) for the due date
       const weekStart = new Date(dueDate);
       const dayOfWeek = weekStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
       
       // Calculate days to get to Monday (start of week)
       let daysToMonday;
       if (dayOfWeek === 0) {
         // Sunday - go back 6 days to get to Monday
         daysToMonday = -6;
       } else {
         // Monday = 1, Tuesday = 2, etc. - go back (dayOfWeek - 1) days
         daysToMonday = -(dayOfWeek - 1);
       }
       
       weekStart.setDate(weekStart.getDate() + daysToMonday);
       weekStart.setHours(0, 0, 0, 0);
       
       const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
       
       
       if (!weeklyGroups[weekKey]) {
         weeklyGroups[weekKey] = {
           weekStart: weekStart,
           analytics: [],
           latestCurrentGrade: 0,
           latestTimestamp: null
         };
       }
       
       // Store the analytics entry
       weeklyGroups[weekKey].analytics.push(analytics);
       
       // Keep track of the latest current_grade for this week (by calculated_at timestamp)
       const currentTimestamp = new Date(analytics.calculatedAt || analytics.createdAt);
       const existingTimestamp = weeklyGroups[weekKey].latestTimestamp ? 
         new Date(weeklyGroups[weekKey].latestTimestamp) : new Date(0);
       
       if (currentTimestamp > existingTimestamp) {
         weeklyGroups[weekKey].latestCurrentGrade = analytics.currentGrade;
         weeklyGroups[weekKey].latestTimestamp = analytics.calculatedAt || analytics.createdAt;
       }
     });
     
     
     // Convert grouped data to weekly format
     const weeklyData = [];
     const sortedWeekKeys = Object.keys(weeklyGroups).sort();
     
     sortedWeekKeys.forEach((weekKey, index) => {
       const group = weeklyGroups[weekKey];
       
       // Only include weeks that have actual grade entries (not just analytics records)
       const hasActualGrades = group.analytics.some(analytics => {
         // Check if this analytics record corresponds to actual grade entries
         // by looking for assignments_completed > 0 AND current_grade > 0
         // This ensures we only show weeks with real grade data
         return analytics.assignmentsCompleted > 0 && analytics.currentGrade > 0;
       });
       
       if (!hasActualGrades) {
         return; // Skip weeks without actual grades
       }
       
       // Convert to proper GPA format
       const rawGrade = group.latestCurrentGrade;
       let currentGPA;
       
       // Check if the value is already in percentage format (> 4.0) or GPA format (<= 4.0)
       if (rawGrade > 4.0) {
         // Value is in percentage format, apply proper GPA scaling directly
         currentGPA = calculateGPAFromPercentage(rawGrade);
       } else {
         // Value is in GPA format but uses wrong scaling (division by 25)
         // Convert back to percentage first, then apply proper GPA scaling
         const percentage = rawGrade * 25; // Convert back to percentage
         currentGPA = calculateGPAFromPercentage(percentage); // Apply proper GPA scaling
       }
       
       const currentGradePercentage = gpaToPercentage(currentGPA); // Convert GPA to percentage using proper scaling
       
       const weekData = {
         weekNumber: index + 1,
         weekStart: group.weekStart,
         currentGPA: currentGPA,
         currentGradePercentage: currentGradePercentage,
         gradeCount: group.analytics.length,
         date: group.weekStart,
         gradeTrend: index > 0 ? currentGPA - weeklyData[index - 1]?.currentGPA : 0,
         analytics: group.analytics // Include the analytics data for this week
       };
       
       weeklyData.push(weekData);
     });

     // Calculate statistics from current grades (convert to proper GPA format)
     const allGPAs = sortedAnalytics.map(analytics => {
       // Check if the value is already in percentage format (> 4.0) or GPA format (<= 4.0)
       if (analytics.currentGrade > 4.0) {
         // Value is in percentage format, apply proper GPA scaling directly
         return calculateGPAFromPercentage(analytics.currentGrade);
       } else {
         // Value is in GPA format but uses wrong scaling (division by 25)
         // Convert back to percentage first, then apply proper GPA scaling
         const percentage = analytics.currentGrade * 25; // Convert back to percentage
         return calculateGPAFromPercentage(percentage); // Apply proper GPA scaling
       }
     });

     // Calculate statistics properly - don't average GPAs directly, average percentages instead
     const allPercentages = allGPAs.map(gpa => gpaToPercentage(gpa));
     const averagePercentage = allPercentages.length > 0 ? allPercentages.reduce((sum, pct) => sum + pct, 0) / allPercentages.length : 0;
     const averageGPA = calculateGPAFromPercentage(averagePercentage);
     
     const statistics = {
       average: averageGPA,
       best: allGPAs.length > 0 ? Math.max(...allGPAs) : 0,
       worst: allGPAs.length > 0 ? Math.min(...allGPAs) : 0,
       totalGrades: allGPAs.length,
       currentGPA: allGPAs.length > 0 ? allGPAs[allGPAs.length - 1] : 0
     };

     return { weekly: weeklyData, statistics };
   }, [grades, course, currentGrade, userAnalytics]);

  // Calculate trend analysis
  const trendAnalysis = useMemo(() => {
    const { weekly } = trajectoryData;
    
    
    if (weekly.length < 2) {
      return {
        direction: 'stable',
        percentage: 0,
        description: weekly.length === 1 ? 'Single data point - trend unknown' : 'Insufficient data for trend analysis',
        icon: '➡️',
        confidence: 'low'
      };
    }

    // Use a more robust trend calculation approach
    // Compare the most recent data point with the earliest data point
    const firstGPA = weekly[0].currentGPA;
    const lastGPA = weekly[weekly.length - 1].currentGPA;
    
    // Also calculate recent trend (last 2-3 data points vs earlier ones)
    let recentAvg, earlyAvg;
    
    if (weekly.length >= 4) {
      // If we have enough data, compare recent vs early periods
      const recentWeeks = weekly.slice(-2); // Last 2 weeks
      const earlyWeeks = weekly.slice(0, 2);  // First 2 weeks
      
      recentAvg = recentWeeks.reduce((sum, week) => sum + week.currentGPA, 0) / recentWeeks.length;
      earlyAvg = earlyWeeks.reduce((sum, week) => sum + week.currentGPA, 0) / earlyWeeks.length;
    } else {
      // For smaller datasets, just compare first and last
      recentAvg = lastGPA;
      earlyAvg = firstGPA;
    }
    
    const change = recentAvg - earlyAvg;
    const absoluteChange = Math.abs(change);
    
    // Calculate percentage change based on the initial GPA
    const changePercentage = earlyAvg > 0 ? (change / earlyAvg) * 100 : 0;


    let direction, description, icon, confidence;
    
    // Use a more sensitive threshold for GPA changes (since GPA scale is smaller)
    if (absoluteChange < 0.1) { // Less than 0.1 GPA change
      direction = 'stable';
      description = 'Consistent performance';
      icon = '➡️';
      confidence = 'high';
    } else if (change > 0) {
      direction = 'improving';
      if (changePercentage > 0) {
        description = `GPA improved by ${changePercentage.toFixed(2)}%`;
      } else {
        description = `GPA increased by ${absoluteChange.toFixed(2)} points`;
      }
      icon = '📈';
      confidence = absoluteChange > 0.3 ? 'high' : 'medium';
    } else {
      direction = 'declining';
      if (changePercentage < 0) {
        description = `GPA declined by ${Math.abs(changePercentage).toFixed(2)}%`;
      } else {
        description = `GPA decreased by ${absoluteChange.toFixed(2)} points`;
      }
      icon = '📉';
      confidence = absoluteChange > 0.3 ? 'high' : 'medium';
    }

    return {
      direction,
      percentage: Math.abs(changePercentage),
      description,
      icon,
      confidence,
      changeValue: change,
      absoluteChange
    };
  }, [trajectoryData]);

  const { weekly = [], statistics = {} } = trajectoryData;
  
  // Pagination logic for weekly performance cards
  const weeksPerPage = 3;
  const totalPages = Math.ceil(weekly.length / weeksPerPage);
  const startIndex = currentPage * weeksPerPage;
  const endIndex = startIndex + weeksPerPage;
  const currentWeeks = weekly.slice(startIndex, endIndex);

  // Enhanced chart component matching EnhancedGradeTrends styling
  const TrajectoryChart = ({ data, title }) => {
    // Debug: Log the data being passed to the chart
    if (!data || data.length === 0) {
      return (
        <div className="bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              📊 Hover over data points to see GPA values
            </div>
          </div>
          
          <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Grade Data Available
              </h3>
              <p className="text-gray-500">
                Add some assessments to see your grade progression based on due dates
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">Track your academic progress over time</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-purple-100 px-4 py-2 rounded-full border border-purple-200">
            <span className="text-purple-600">ℹ️</span>
            <span className="font-medium">Hover for details</span>
          </div>
        </div>

        <div className="h-80 bg-white rounded-lg p-6 border border-gray-200 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" opacity={0.6} />
              <XAxis
                dataKey="weekNumber"
                stroke="#6b7280"
                fontSize={14}
                tick={{ fill: "#374151", fontWeight: "500" }}
                tickFormatter={(value) => `Week ${value}`}
                axisLine={{ stroke: "#d1d5db", strokeWidth: 2 }}
                tickLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
              />
              <YAxis
                domain={[0, 4]}
                stroke="#6b7280"
                fontSize={14}
                tick={{ fill: "#374151", fontWeight: "500" }}
                tickFormatter={(value) => `${value.toFixed(2)}`}
                axisLine={{ stroke: "#d1d5db", strokeWidth: 2 }}
                tickLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                label={{ 
                  value: 'GPA Scale', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: '600' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="currentGPA"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6, stroke: "#fff" }}
                activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff", filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))" }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Performance Trend</h3>
              <p className="text-xs text-gray-600">Analyzing your academic progression</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow border transition-all duration-300 ${
            trendAnalysis.direction === 'improving' 
              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300' :
            trendAnalysis.direction === 'declining' 
              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300' :
              'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
          }`}>
            <span className="mr-1">{trendAnalysis.icon}</span>
            <span className="capitalize">{trendAnalysis.direction}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 shadow border border-gray-200 hover:border-purple-300 transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow">
                <span className="text-white text-lg">📈</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {trendAnalysis.percentage > 0 
                  ? `${trendAnalysis.percentage.toFixed(2)}%`
                  : trendAnalysis.absoluteChange 
                    ? `${trendAnalysis.absoluteChange.toFixed(2)} pts`
                    : '0%'
                }
              </div>
              <div className="text-xs font-medium text-gray-600">Change</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow border border-gray-200 hover:border-blue-300 transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow">
                <span className="text-white text-lg">ℹ️</span>
              </div>
              <div className="text-sm font-bold text-gray-800 mb-1">{trendAnalysis.description}</div>
              <div className="text-xs font-medium text-gray-600">Trend Analysis</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow border border-gray-200 hover:border-green-300 transition-all duration-300">
            <div className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow ${
                trendAnalysis.confidence === 'high' 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' :
                trendAnalysis.confidence === 'medium'
                  ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}>
                <span className="text-white text-lg">✓</span>
              </div>
              <div className="text-sm font-bold text-gray-800 capitalize mb-1">{trendAnalysis.confidence}</div>
              <div className="text-xs font-medium text-gray-600">Confidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {weekly.length > 0 ? (
        <div className="w-full">
          {/* Weekly Trajectory Chart */}
          <TrajectoryChart
            data={weekly}
            title="Weekly GPA Trajectory (Based on Assessment Due Dates)"
              />
            </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <span className="text-6xl mb-4 text-gray-300">📊</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Grade Data Available</h3>
          <p className="text-gray-500">Complete some assessments to see your grade trajectory analysis based on due dates</p>
                </div>
              )}

       {/* Performance Summary */}
       {weekly.length > 0 && (
         <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-bold text-gray-800">Recent Performance Summary</h3>
             <div className="flex items-center space-x-2 text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
               </svg>
               <span>Weekly Breakdown</span>
             </div>
            </div>

           <div className="mb-6">
             <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
               <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
               </svg>
               Weekly Performance
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {currentWeeks.map((week, index) => {
                 // Get the actual due dates from the analytics in this week
                 const dueDates = week.analytics?.map(analytics => {
                   const dueDate = new Date(analytics.dueDate || analytics.createdAt);
                   return dueDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
                 }) || [];
                 const uniqueDueDates = [...new Set(dueDates)].join(', ');
                 
                 // Determine performance color based on GPA
                 const getPerformanceColor = (gpa) => {
                   if (gpa >= 3.5) return 'from-green-400 to-green-600';
                   if (gpa >= 3.0) return 'from-blue-400 to-blue-600';
                   if (gpa >= 2.5) return 'from-yellow-400 to-yellow-600';
                   return 'from-red-400 to-red-600';
                 };
                 
                 return (
                   <div key={week.weekNumber} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-200">
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-2">
                         <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPerformanceColor(week.currentGPA)}`}></div>
                         <span className="font-bold text-gray-800 text-lg">Week {week.weekNumber}</span>
                       </div>
                       <div className="text-right">
                         <div className="text-xs text-gray-500 mb-1">
                           Due: {uniqueDueDates}
                         </div>
                         <div className="text-xs text-gray-500">
                           {week.gradeCount} update{week.gradeCount !== 1 ? 's' : ''}
                         </div>
                      </div>
                    </div>
                     
                     <div className="space-y-3">
                       <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                         <span className="text-sm font-medium text-gray-600">Current Grade:</span>
                         <span className="font-bold text-lg text-gray-800">{week.currentGradePercentage.toFixed(2)}%</span>
                       </div>
                       <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                         <span className="text-sm font-medium text-gray-600">GPA:</span>
                         <span className={`font-bold text-lg ${week.currentGPA >= 3.5 ? 'text-green-600' : week.currentGPA >= 3.0 ? 'text-blue-600' : week.currentGPA >= 2.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                           {week.currentGPA.toFixed(2)}
                         </span>
                       </div>
                    </div>
                  </div>
                );
              })}
             </div>
             
             {/* Pagination Navigation */}
             {totalPages > 1 && (
               <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                 <button
                   onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                   disabled={currentPage === 0}
                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                     currentPage === 0 
                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                       : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md'
                   }`}
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                   </svg>
                   <span className="font-medium">Previous</span>
                 </button>
                 
                 <div className="flex items-center space-x-2">
                   <span className="text-sm text-gray-600">
                     Page {currentPage + 1} of {totalPages}
                   </span>
                   <div className="flex space-x-1">
                     {Array.from({ length: totalPages }, (_, i) => (
                       <button
                         key={i}
                         onClick={() => setCurrentPage(i)}
                         className={`w-2 h-2 rounded-full transition-all duration-200 ${
                           i === currentPage ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                         }`}
                       />
                ))}
              </div>
            </div>
                 
                 <button
                   onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                   disabled={currentPage === totalPages - 1}
                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                     currentPage === totalPages - 1 
                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                       : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md'
                   }`}
                 >
                   <span className="font-medium">Next</span>
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                   </svg>
                 </button>
        </div>
      )}
           </div>

           {/* Enhanced Statistics */}
           <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
             <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
               <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
               </svg>
               Performance Statistics
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.average?.toFixed(2) || '0.00'}</div>
                 <div className="text-sm text-gray-600 font-medium">Average GPA</div>
                 <div className="text-xs text-gray-500 mt-1">({gpaToPercentage(statistics.average || 0).toFixed(2)}%)</div>
               </div>
               <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-3xl font-bold text-green-600 mb-1">{statistics.best?.toFixed(2) || '0.00'}</div>
                 <div className="text-sm text-gray-600 font-medium">Best Performance</div>
                 <div className="text-xs text-gray-500 mt-1">({gpaToPercentage(statistics.best || 0).toFixed(2)}%)</div>
               </div>
               <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-3xl font-bold text-red-600 mb-1">{statistics.worst?.toFixed(2) || '0.00'}</div>
                 <div className="text-sm text-gray-600 font-medium">Worst Performance</div>
                 <div className="text-xs text-gray-500 mt-1">({gpaToPercentage(statistics.worst || 0).toFixed(2)}%)</div>
              </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedProgress;
