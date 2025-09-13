// ========================================
// GRADE PROGRESSION CHART COMPONENT
// ========================================
// Line chart showing grade progression over time with trend analysis

import React, { useMemo } from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function GradeProgressionChart({ 
  grades, 
  targetGrade, 
  course 
}) {
  // Process grades data for chart
  const chartData = useMemo(() => {
    const allGrades = Object.values(grades).flat()
      .filter(grade => 
        grade.score !== null && 
        grade.score !== undefined && 
        grade.score !== "" && 
        !isNaN(parseFloat(grade.score)) &&
        grade.date
      )
      .map(grade => {
        let adjustedScore = grade.score;
        if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
          adjustedScore += grade.extraCreditPoints;
        }
        const percentage = (adjustedScore / grade.maxScore) * 100;
        
        // Validate percentage calculation
        if (isNaN(percentage) || !isFinite(percentage) || percentage < 0 || percentage > 200) {
          return null;
        }
        
        return {
          date: new Date(grade.date),
          percentage,
          gpa: convertPercentageToGPA(percentage, course.gpaScale || "4.0"),
          name: grade.name,
          category: grade.categoryId
        };
      })
      .filter(grade => grade !== null) // Remove invalid entries
      .sort((a, b) => a.date - b.date);

    // Calculate cumulative average
    let cumulativeSum = 0;
    const cumulativeData = allGrades.map((grade, index) => {
      cumulativeSum += grade.percentage;
      const cumulativeAverage = cumulativeSum / (index + 1);
      
      // Validate cumulative average
      if (isNaN(cumulativeAverage) || !isFinite(cumulativeAverage)) {
        return {
          ...grade,
          cumulativeAverage: 0,
          cumulativeGPA: 0
        };
      }
      
      return {
        ...grade,
        cumulativeAverage,
        cumulativeGPA: convertPercentageToGPA(cumulativeAverage, course.gpaScale || "4.0")
      };
    });

    return cumulativeData;
  }, [grades, course.gpaScale]);

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstHalf = chartData.slice(0, Math.ceil(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.percentage, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    const changePercentage = Math.abs(change / firstAvg) * 100;
    
    if (change > 2) return { direction: 'improving', percentage: changePercentage };
    if (change < -2) return { direction: 'declining', percentage: changePercentage };
    return { direction: 'stable', percentage: changePercentage };
  };

  const trend = getTrend();

  // Simple SVG chart component
  const SimpleLineChart = ({ data, targetValue, width = 400, height = 200 }) => {
    if (data.length === 0) return null;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min/max values with proper validation
    const percentages = data.map(d => d.percentage).filter(p => !isNaN(p) && isFinite(p));
    if (percentages.length === 0) return null;

    const minValue = Math.min(...percentages, targetValue || 0) - 5;
    const maxValue = Math.max(...percentages, targetValue || 100) + 5;

    // Ensure we don't have division by zero
    const valueRange = maxValue - minValue;
    if (valueRange === 0) return null;

    // Scale functions with proper handling for single data points
    const scaleX = (index) => {
      if (data.length === 1) return chartWidth / 2 + padding;
      return (index / (data.length - 1)) * chartWidth + padding;
    };
    
    const scaleY = (value) => {
      if (isNaN(value) || !isFinite(value)) return padding;
      return chartHeight - ((value - minValue) / valueRange) * chartHeight + padding;
    };

    // Generate path for line with validation
    const linePath = data.map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.percentage);
      // Only include valid coordinates
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        return '';
      }
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).filter(path => path !== '').join(' ');

    // Target line
    const targetY = targetValue ? scaleY(targetValue) : null;

    return (
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Target line */}
        {targetY && (
          <line
            x1={padding}
            y1={targetY}
            x2={width - padding}
            y2={targetY}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Data line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {data.map((point, index) => {
          const cx = scaleX(index);
          const cy = scaleY(point.percentage);
          // Only render valid data points
          if (isNaN(cx) || isNaN(cy) || !isFinite(cx) || !isFinite(cy)) {
            return null;
          }
          return (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r="4"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Y-axis labels */}
        {[minValue, (minValue + maxValue) / 2, maxValue].map((value, index) => {
          const y = scaleY(value);
          if (isNaN(y) || !isFinite(y)) return null;
          return (
            <text
              key={index}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-gray-600"
            >
              {value.toFixed(0)}%
            </text>
          );
        })}
      </svg>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Grade Progression
          </h3>
        </div>
        <div className="p-8 text-center">
          <span className="text-6xl mb-4 text-gray-300">📈</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Grade Data</h3>
          <p className="text-gray-500">Complete some assessments to see grade progression</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">📈</span>
          Grade Progression
        </h3>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Trend Indicator */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-sm font-semibold bg-gray-50">
            {trend.direction === 'improving' && '📈'}
            {trend.direction === 'declining' && '📉'}
            {trend.direction === 'stable' && '➡️'}
            {trend.direction === 'improving' && 'Improving'}
            {trend.direction === 'declining' && 'Declining'}
            {trend.direction === 'stable' && 'Stable'}
            <span className="ml-1">({trend.percentage.toFixed(1)}% change)</span>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <SimpleLineChart 
            data={chartData} 
            targetValue={targetGrade ? parseFloat(targetGrade) * 25 : null} // Convert GPA to percentage for target line
            width={600} 
            height={250} 
          />
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-600"></div>
            <span className="text-gray-600">Your Progress</span>
          </div>
          {targetGrade && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t-2 border-gray-400"></div>
              <span className="text-gray-600">Target Goal</span>
            </div>
          )}
        </div>

        {/* Recent Performance */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Performance</h4>
          <div className="space-y-2">
            {chartData.slice(-3).map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div>
                  <div className="font-medium text-gray-900">{grade.name}</div>
                  <div className="text-sm text-gray-600">
                    {grade.date.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{grade.percentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">{grade.gpa.toFixed(2)} GPA</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradeProgressionChart;
