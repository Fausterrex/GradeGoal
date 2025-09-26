// ========================================
// UNIFIED PROGRESS COMPONENT
// ========================================
// Consolidated component that combines goal progress, grade progression chart, and trend indicators

import React, { useMemo, useState } from "react";
import { percentageToGPA } from "../../academic_goal/gpaConversionUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
            {`Percentage: ${Math.round((gpaValue / 4.0) * 100)}%`}
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
       
       // Use current_grade directly as GPA (it's already in GPA format from database)
       const currentGPA = group.latestCurrentGrade;
       const currentGradePercentage = currentGPA * 25; // Convert GPA to percentage for display
       
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

     // Calculate statistics from current grades (already in GPA format)
     const allGPAs = sortedAnalytics.map(analytics => analytics.currentGrade);

     const statistics = {
       average: allGPAs.length > 0 ? allGPAs.reduce((sum, gpa) => sum + gpa, 0) / allGPAs.length : 0,
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
        description: 'Insufficient data for trend analysis',
        icon: '➡️',
        confidence: 'low'
      };
    }

    // Analyze weekly trend
    const recentWeeks = weekly.slice(-3); // Last 3 weeks
    const earlyWeeks = weekly.slice(0, Math.min(3, weekly.length));
    
    const recentAvg = recentWeeks.reduce((sum, week) => sum + week.currentGPA, 0) / recentWeeks.length;
    const earlyAvg = earlyWeeks.reduce((sum, week) => sum + week.currentGPA, 0) / earlyWeeks.length;
    
    const change = recentAvg - earlyAvg;
    const changePercentage = earlyAvg > 0 ? (change / earlyAvg) * 100 : 0;

    let direction, description, icon, confidence;
    
    if (Math.abs(changePercentage) < 5) {
      direction = 'stable';
      description = 'Consistent performance';
      icon = '➡️';
      confidence = 'medium';
    } else if (changePercentage > 0) {
      direction = 'improving';
      description = `GPA increased by ${Math.abs(changePercentage).toFixed(1)}%`;
      icon = '📈';
      confidence = changePercentage > 15 ? 'high' : 'medium';
    } else {
      direction = 'declining';
      description = `GPA decreased by ${Math.abs(changePercentage).toFixed(1)}%`;
      icon = '📉';
      confidence = changePercentage < -15 ? 'high' : 'medium';
    }

      return {
      direction,
      percentage: Math.abs(changePercentage),
      description,
      icon,
      confidence,
      changeValue: change
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
      <div className="bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            📊 Hover over data points to see GPA values
          </div>
        </div>

        <div className="h-96 bg-white rounded-xl p-4 border border-gray-200">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="weekNumber"
                stroke="#6b7280"
                fontSize={14}
                tick={{ fill: "#374151" }}
                fontWeight="500"
              />
              <YAxis
                domain={[0, 4]}
                stroke="#6b7280"
                fontSize={14}
                tick={{ fill: "#374151" }}
                tickFormatter={(value) => `${value.toFixed(1)}`}
                fontWeight="500"
                label={{ 
                  value: 'GPA Scale', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: '600' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="currentGPA"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff" }}
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Performance Trend</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            trendAnalysis.direction === 'improving' ? 'bg-green-100 text-green-800' :
            trendAnalysis.direction === 'declining' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trendAnalysis.icon} {trendAnalysis.direction}
          </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{trendAnalysis.percentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Change</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{trendAnalysis.description}</div>
            <div className="text-sm text-gray-600">Trend Analysis</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800 capitalize">{trendAnalysis.confidence}</div>
            <div className="text-sm text-gray-600">Confidence</div>
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
                         <span className="font-bold text-lg text-gray-800">{week.currentGradePercentage.toFixed(1)}%</span>
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
               </div>
               <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-3xl font-bold text-green-600 mb-1">{statistics.best?.toFixed(2) || '0.00'}</div>
                 <div className="text-sm text-gray-600 font-medium">Best Performance</div>
               </div>
               <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-3xl font-bold text-red-600 mb-1">{statistics.worst?.toFixed(2) || '0.00'}</div>
                 <div className="text-sm text-gray-600 font-medium">Worst Performance</div>
              </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedProgress;
