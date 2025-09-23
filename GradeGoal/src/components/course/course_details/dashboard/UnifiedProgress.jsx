// ========================================
// UNIFIED PROGRESS COMPONENT
// ========================================
// Consolidated component that combines goal progress, grade progression chart, and trend indicators

import React, { useMemo } from "react";
import { percentageToGPA } from "../../academic_goal/gpaConversionUtils";

function UnifiedProgress({ 
  currentGrade, 
  course, 
  grades, 
  categories,
  colorScheme,
  userAnalytics 
}) {

  // Calculate trajectory data using database analytics (preferred) or fallback to grades
  const trajectoryData = useMemo(() => {

    // Use userAnalytics data if available (preferred method)
    if (userAnalytics && (Array.isArray(userAnalytics) ? userAnalytics.length > 0 : userAnalytics.current_grade !== undefined)) {
      
      // Handle both array and object formats
      if (Array.isArray(userAnalytics)) {

        // Sort analytics by date first, then by calculatedAt for records with same date
        const sortedAnalytics = [...userAnalytics].sort((a, b) => {
          const dateA = new Date(a.analyticsDate);
          const dateB = new Date(b.analyticsDate);
          
          // Handle invalid dates by putting them at the end
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
            // If both dates are invalid, sort by calculatedAt or analyticsId
            return (a.calculatedAt ? new Date(a.calculatedAt) : new Date(a.analyticsId || 0)) - 
                   (b.calculatedAt ? new Date(b.calculatedAt) : new Date(b.analyticsId || 0));
          }
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          // If dates are the same, sort by calculatedAt or analyticsId
          if (dateA.getTime() === dateB.getTime()) {
            return (a.calculatedAt ? new Date(a.calculatedAt) : new Date(a.analyticsId || 0)) - 
                   (b.calculatedAt ? new Date(b.calculatedAt) : new Date(b.analyticsId || 0));
          }
          
          return dateA - dateB;
        });

        // Create progression based on order of records instead of grouping by date
        // Since all records have the same date, we'll create artificial weeks based on order
        const weeklyData = [];
        let weekNumber = 1;


        sortedAnalytics.forEach((analytics, index) => {
          // Create a week for each analytics record to show progression
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (sortedAnalytics.length - index) * 7); // Space them a week apart
          weekStart.setHours(0, 0, 0, 0);

          weeklyData.push({
            weekNumber: weekNumber,
            weekStart: weekStart,
            currentGPA: analytics.currentGrade || 0,
            weekAverage: analytics.currentGrade || 0,
            gradeCount: analytics.assignmentsCompleted || 0,
            date: weekStart,
            gradeTrend: analytics.gradeTrend || 0
          });

          weekNumber++;
        });

        // Calculate statistics from analytics
        const latestAnalytics = sortedAnalytics[sortedAnalytics.length - 1];
        const allGPAs = sortedAnalytics.map(a => a.currentGrade || 0);

        const statistics = {
          average: latestAnalytics?.currentGrade || 0,
          best: allGPAs.length > 0 ? Math.max(...allGPAs) : 0,
          worst: allGPAs.length > 0 ? Math.min(...allGPAs) : 0,
          totalGrades: latestAnalytics?.assignmentsCompleted || 0,
          currentGPA: latestAnalytics?.currentGrade || 0
        };

            return { weekly: weeklyData, statistics };
      } else {
        // Handle single analytics object
        
        // Create a single week entry with current data
        const weeklyData = [{
          weekNumber: 1,
          weekStart: new Date(),
          currentGPA: userAnalytics.currentGrade || 0,
          weekAverage: userAnalytics.currentGrade || 0,
          gradeCount: userAnalytics.assignmentsCompleted || 0,
          date: new Date(),
          gradeTrend: userAnalytics.gradeTrend || 0
        }];

        const statistics = {
          average: userAnalytics.currentGrade || 0,
          best: userAnalytics.currentGrade || 0,
          worst: userAnalytics.currentGrade || 0,
          totalGrades: userAnalytics.assignmentsCompleted || 0,
          currentGPA: userAnalytics.currentGrade || 0
        };

        return { weekly: weeklyData, statistics };
      }
    }

    
    // Fallback to grade-based calculation if no analytics available
    const allGrades = Object.values(grades).flat();
    
    const completedGrades = allGrades.filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score)) &&
      (grade.date || grade.assessment?.dueDate || grade.dueDate) // Check for due date in date field or assessment
    );

    if (completedGrades.length === 0) {
      return { weekly: [], statistics: {} };
    }

    // Sort by due date (from date field) instead of submission date
    completedGrades.sort((a, b) => {
      const dueDateA = new Date(a.date || a.assessment?.dueDate || a.dueDate || a.updatedAt || a.createdAt);
      const dueDateB = new Date(b.date || b.assessment?.dueDate || b.dueDate || b.updatedAt || b.createdAt);
      return dueDateA - dueDateB;
    });


    // Calculate weekly progression based on due dates
    const weeklyData = [];
    
    // Group by weeks based on due dates
    const weekGroups = {};

    completedGrades.forEach((grade, index) => {
      const dueDate = new Date(grade.date || grade.assessment?.dueDate || grade.dueDate || grade.updatedAt || grade.createdAt);
      const weekStart = new Date(dueDate);
      weekStart.setDate(dueDate.getDate() - dueDate.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekKey = weekStart.toISOString();


      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = { grades: [], weekStart };
      }

      weekGroups[weekKey].grades.push(grade);
    });


    // Calculate weekly trajectory - use actual course GPA progression
    let weekNumber = 1;

    Object.keys(weekGroups).sort().forEach(weekKey => {
      const weekData = weekGroups[weekKey];
      const weekGrades = weekData.grades;
      
      
      // Calculate the course GPA at this point in time (cumulative)
      const weekGradesWithGPA = weekGrades.map(grade => {
        const percentage = (parseFloat(grade.score) / parseFloat(grade.maxScore)) * 100;
        const gpa = percentageToGPA(percentage, course?.gpaScale === '5.0' ? 5.0 : 4.0);
        return { ...grade, gpa, percentage };
      });

      // Calculate weighted average for this week (simplified - in real scenario you'd need category weights)
      const weekAverage = weekGradesWithGPA.reduce((sum, grade) => sum + grade.gpa, 0) / weekGradesWithGPA.length;
      
      // For current GPA, use the actual course GPA passed as prop
      const currentGPA = typeof currentGrade === 'number' && currentGrade > 0 ? currentGrade : 0;

      const weekDataPoint = {
        weekNumber,
        weekStart: weekData.weekStart,
        currentGPA: parseFloat(currentGPA.toFixed(2)),
        weekAverage: parseFloat(weekAverage.toFixed(2)),
        gradeCount: weekGrades.length,
        date: weekData.weekStart,
        dueDate: weekData.weekStart // Use due date for display
      };

      weeklyData.push(weekDataPoint);
      
      weekNumber++;
    });

    // Calculate statistics using the actual course GPA instead of individual grade averages
    const allGPAs = completedGrades.map(grade => {
      const percentage = (parseFloat(grade.score) / parseFloat(grade.maxScore)) * 100;
      return percentageToGPA(percentage, course?.gpaScale === '5.0' ? 5.0 : 4.0);
    });

    // Use the actual course GPA as the average, not individual grade average
    const actualCourseGPA = typeof currentGrade === 'number' ? currentGrade : 0;

    const statistics = {
      average: actualCourseGPA, // Use actual course GPA instead of individual grade average
      best: allGPAs.length > 0 ? parseFloat(Math.max(...allGPAs).toFixed(2)) : 0,
      worst: allGPAs.length > 0 ? parseFloat(Math.min(...allGPAs).toFixed(2)) : 0,
      totalGrades: allGPAs.length,
      currentGPA: actualCourseGPA
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

  // Enhanced SVG chart component for GPA trajectory analysis
  const TrajectoryChart = ({ data, targetValue, width = 800, height = 400, title, xLabel, yLabel }) => {
    if (data.length === 0) return null;

    const padding = 70;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const gpaValues = data.map(d => d.currentGPA).filter(gpa => !isNaN(gpa) && isFinite(gpa));
    if (gpaValues.length === 0) return null;

    const gpaScale = parseFloat(course?.gpaScale || "4.0");
    const minValue = Math.max(0, Math.min(...gpaValues) - 0.3);
    const maxValue = Math.min(gpaScale, Math.max(...gpaValues, targetValue || 0) + 0.3);
    const valueRange = maxValue - minValue;
    if (valueRange === 0) return null;

    const scaleX = (index) => {
      if (data.length === 1) return chartWidth / 2 + padding;
      return (index / (data.length - 1)) * chartWidth + padding;
    };
    
    const scaleY = (gpaValue) => {
      if (isNaN(gpaValue) || !isFinite(gpaValue)) return padding;
      return chartHeight - ((gpaValue - minValue) / valueRange) * chartHeight + padding;
    };

    const linePath = data.map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.currentGPA);
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        return '';
      }
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).filter(path => path !== '').join(' ');

    const targetY = targetValue ? scaleY(targetValue) : null;

    // Generate GPA scale labels
    const gpaLabels = [];
    const step = valueRange / 4;
    for (let i = 0; i <= 4; i++) {
      const gpaValue = minValue + (step * i);
      gpaLabels.push(gpaValue);
    }

    // Calculate trend line
    const trendLine = data.length > 1 ? (() => {
      const sumX = data.reduce((sum, _, index) => sum + index, 0);
      const sumY = data.reduce((sum, point) => sum + point.currentGPA, 0);
      const sumXY = data.reduce((sum, point, index) => sum + index * point.currentGPA, 0);
      const sumXX = data.reduce((sum, _, index) => sum + index * index, 0);
      const n = data.length;
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      const startY = scaleY(intercept);
      const endY = scaleY(slope * (n - 1) + intercept);
      
      return `M ${padding} ${startY} L ${width - padding} ${endY}`;
    })() : null;

    return (
      <div className="bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">📊</span>
            {title}
          </h3>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            📊 Hover over data points to see GPA values
          </div>
        </div>
        
        <div className="h-96 bg-white rounded-xl p-4 border border-gray-200">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
                <pattern id="grid-weekly" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
                <linearGradient id="gradient-weekly" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05"/>
                </linearGradient>
        </defs>
              
              <rect width="100%" height="100%" fill="url(#grid-weekly)" />

        {/* Target GPA line */}
        {targetY && (
            <>
          <line
            x1={padding}
            y1={targetY}
            x2={width - padding}
            y2={targetY}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
              />
              <text
                x={width - padding - 5}
                y={targetY - 5}
                textAnchor="end"
                className="text-xs fill-blue-600 font-medium"
              >
                Target: {targetValue?.toFixed(2)}
              </text>
            </>
          )}

          {/* Trend line */}
          {trendLine && (
            <path
              d={trendLine}
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              strokeDasharray="3,3"
              opacity="0.7"
            />
          )}

          {/* GPA progression line with gradient fill */}
        {linePath && (
            <>
              <path
                d={`${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
                fill="url(#gradient-weekly)"
              />
          <path
            d={linePath}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
            </>
        )}

        {/* Data points */}
        {data.map((point, index) => {
            const cx = scaleX(index);
          const cy = scaleY(point.currentGPA);
          if (isNaN(cx) || isNaN(cy) || !isFinite(cx) || !isFinite(cy)) {
            return null;
          }
          return (
              <g key={index}>
            <circle
              cx={cx}
              cy={cy}
              r="4"
              fill="#8b5cf6"
              stroke="white"
              strokeWidth="2"
                  className="hover:r-6 transition-all duration-200"
                />
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-700 font-medium"
                >
                  {point.currentGPA.toFixed(2)}
                </text>
              </g>
          );
        })}

        {/* Y-axis GPA labels */}
        {gpaLabels.map((gpaValue, index) => {
          const y = scaleY(gpaValue);
          if (isNaN(y) || !isFinite(y)) return null;
          return (
              <g key={index}>
                <line
                  x1={padding}
                  y1={y}
                  x2={padding - 5}
                  y2={y}
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
            <text
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-gray-600"
            >
              {gpaValue.toFixed(1)}
            </text>
              </g>
          );
        })}

          {/* X-axis labels */}
        {data.map((point, index) => {
            const x = scaleX(index);
          if (isNaN(x) || !isFinite(x)) return null;
          return (
              <g key={index}>
                <line
                  x1={x}
                  y1={height - padding}
                  x2={x}
                  y2={height - padding + 5}
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
            <text
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              W{point.weekNumber}
            </text>
              </g>
          );
        })}

        {/* Axis labels */}
        <text
            x={padding - 40}
          y={height / 2}
          textAnchor="middle"
          className="text-sm fill-gray-700 font-medium"
            transform={`rotate(-90, ${padding - 40}, ${height / 2})`}
        >
            {yLabel}
        </text>
        <text
          x={width / 2}
            y={height - 20}
          textAnchor="middle"
          className="text-sm fill-gray-700 font-medium"
        >
            {xLabel}
        </text>
      </svg>

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 text-sm mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-500"></div>
            <span className="text-gray-600">Current GPA</span>
          </div>
          {targetValue && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2 border-blue-500"></div>
              <span className="text-gray-600">Target GPA</span>
            </div>
          )}
          {trendLine && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t-2 border-gray-400"></div>
              <span className="text-gray-600">Trend Line</span>
            </div>
          )}
        </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-2xl">📈</span>
          Grade Trajectory Analysis
        </h2>
        <p className="text-gray-600 mt-2">Track your academic progress over time based on assessment due dates</p>
      </div>

      {/* Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend Direction */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trend Direction</h3>
            <span className="text-2xl">{trendAnalysis.icon}</span>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            trendAnalysis.direction === 'improving' ? 'bg-green-100 text-green-800' :
            trendAnalysis.direction === 'declining' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            <span className="capitalize">{trendAnalysis.direction}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{trendAnalysis.description}</p>
          <div className="mt-3">
            <span className={`text-xs px-2 py-1 rounded ${
              trendAnalysis.confidence === 'high' ? 'bg-blue-100 text-blue-800' :
              trendAnalysis.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {trendAnalysis.confidence} confidence
            </span>
              </div>
            </div>

        {/* Statistical Indicators */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average GPA</span>
              <span className="font-semibold text-gray-900">{(statistics.average || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best Performance</span>
              <span className="font-semibold text-green-600">{(statistics.best || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Worst Performance</span>
              <span className="font-semibold text-red-600">{(statistics.worst || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Grades</span>
              <span className="font-semibold text-gray-900">{statistics.totalGrades || 0}</span>
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
            targetValue={null}
            width={800}
            height={400}
            title="Weekly GPA Trajectory"
            xLabel="Week"
            yLabel="GPA"
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <span className="text-6xl mb-4 text-gray-300">📊</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Grade Data Available</h3>
          <p className="text-gray-500">Complete some assessments to see your grade trajectory analysis</p>
        </div>
      )}

      {/* Performance Summary */}
      {weekly.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance Summary</h3>
          <div className="w-full">
            {/* Weekly Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Weekly Performance</h4>
              <div className="space-y-2">
                {weekly.slice(-4).map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div>
                      <div className="font-medium text-gray-900">Week {week.weekNumber}</div>
                      <div className="text-sm text-gray-600">
                        Due: {week.weekStart.toLocaleDateString()} - {week.gradeCount} assessment{week.gradeCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                     <div className="text-right">
                      <div className="font-semibold text-gray-900">{(week.currentGPA || 0).toFixed(2)} GPA</div>
                      <div className="text-sm text-gray-600">Week Avg: {(week.weekAverage || 0).toFixed(2)}</div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedProgress;
