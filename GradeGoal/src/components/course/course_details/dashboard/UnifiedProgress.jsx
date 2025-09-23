// ========================================
// UNIFIED PROGRESS COMPONENT
// ========================================
// Consolidated component that combines goal progress, grade progression chart, and trend indicators

import React, { useMemo } from "react";
import { convertPercentageToGPA } from "../../../../utils/gradeCalculations";

function UnifiedProgress({
  currentGrade,
  targetGrade,
  course,
  grades,
  categories,
  colorScheme
}) {

  // Process grades data for chart and trends
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
      .filter(grade => grade !== null)
      .sort((a, b) => a.date - b.date);

    // Calculate cumulative average
    let cumulativeSum = 0;
    const cumulativeData = allGrades.map((grade, index) => {
      cumulativeSum += grade.percentage;
      const cumulativeAverage = cumulativeSum / (index + 1);

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

  // Calculate trends
  const getTrends = () => {
    if (chartData.length < 2) {
      return {
        direction: 'stable',
        percentage: 0,
        description: 'Not enough data',
        icon: '➡️'
      };
    }

    const firstHalf = chartData.slice(0, Math.ceil(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));

    const firstAvg = firstHalf.reduce((sum, item) => sum + item.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.percentage, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const changePercentage = Math.abs(change / firstAvg) * 100;

    if (change > 2) {
      return {
        direction: 'improving',
        percentage: changePercentage,
        description: `Improving by ${changePercentage.toFixed(1)}%`,
        icon: '📈'
      };
    }
    if (change < -2) {
      return {
        direction: 'declining',
        percentage: changePercentage,
        description: `Declining by ${changePercentage.toFixed(1)}%`,
        icon: '📉'
      };
    }
    return {
      direction: 'stable',
      percentage: changePercentage,
      description: 'Stable performance',
      icon: '➡️'
    };
  };

  const trends = getTrends();

  // Simple SVG chart component
  const SimpleLineChart = ({ data, targetValue, width = 400, height = 200 }) => {
    if (data.length === 0) return null;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const percentages = data.map(d => d.percentage).filter(p => !isNaN(p) && isFinite(p));
    if (percentages.length === 0) return null;

    const minValue = Math.min(...percentages, targetValue || 0) - 5;
    const maxValue = Math.max(...percentages, targetValue || 100) + 5;
    const valueRange = maxValue - minValue;
    if (valueRange === 0) return null;

    const scaleX = (index) => {
      if (data.length === 1) return chartWidth / 2 + padding;
      return (index / (data.length - 1)) * chartWidth + padding;
    };

    const scaleY = (value) => {
      if (isNaN(value) || !isFinite(value)) return padding;
      return chartHeight - ((value - minValue) / valueRange) * chartHeight + padding;
    };

    const linePath = data.map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.percentage);
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        return '';
      }
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).filter(path => path !== '').join(' ');

    const targetY = targetValue ? scaleY(targetValue) : null;

    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect
          x={padding}
          y={padding}
          width={chartWidth}
          height={chartHeight}
          fill="url(#grid)"
          stroke="#d1d5db"
          strokeWidth="1"
        />


        {data.map((point, index) => {
          if (index === 0) return null;

          const prevPoint = data[index - 1];
          const x1 = scaleX(index - 1);
          const y1 = scaleY(prevPoint.percentage);
          const x2 = scaleX(index);
          const y2 = scaleY(point.percentage);

          if ([x1, y1, x2, y2].some(v => isNaN(v) || !isFinite(v))) {
            return null;
          }


          const color = point.percentage >= prevPoint.percentage ? "#10b981" : "#ef4444";

          const cx1 = x1 + (x2 - x1) / 2;
          const cy1 = y1;
          const cx2 = x1 + (x2 - x1) / 2;
          const cy2 = y2;

          return (
            <path
              key={`seg-${index}`}
              d={`M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {targetY && (
          <line
            x1={padding}
            y1={targetY}
            x2={width - padding}
            y2={targetY}
            stroke="#000000ff"
            strokeWidth="2"
            strokeDasharray="5,5" />)}

        {/* Dots that match direction */}
        {data.map((point, index) => {
          const cx = scaleX(index);
          const cy = scaleY(point.percentage);

          if (isNaN(cx) || isNaN(cy) || !isFinite(cx) || !isFinite(cy)) {
            return null;
          }

          // Default to green; update based on previous point
          let fill = "#10b981";
          if (index > 0) {
            const prevPoint = data[index - 1];
            fill = point.percentage >= prevPoint.percentage ? "#10b981" : "#ef4444";
          }

          return (
            <circle
              key={`dot-${index}`}
              cx={cx}
              cy={cy}
              r="4"
              fill={fill}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}


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


  return (
    <div className="space-y-6">
      {/* Grade Progression Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-400 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Grade Progression
            </h3>
          </div>

          <div className="p-6">
            {/* Trend Indicator */}
            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-xl text-sm font-semibold 
        ${trends.direction === "declining"
                    ? "bg-red-100 border-red-300 text-red-800"
                    : trends.direction === "improving"
                      ? "bg-green-100 border-green-300 text-green-800"
                      : trends.direction === "stable"
                        ? "bg-orange-100 border-orange-300 text-orange-800"
                        : "bg-gray-50 border-gray-300 text-gray-800"
                  }`}
              >
                <span className="text-lg">{trends.icon}</span>
                <span className="capitalize">{trends.direction}</span>
                <span className="ml-1">({trends.description})</span>
              </div>
            </div>


            {/* Chart */}
            <div className="mb-6">
              <SimpleLineChart
                data={chartData}
                targetValue={targetGrade ? parseFloat(targetGrade) * 25 : null}
                width={1450}
                height={400}
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
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Recent Performance</h4>
              <div className="space-y-2">
                {chartData.slice(-3).map((grade, index) => {
                  const bgColor =
                    grade.percentage < 40
                      ? "bg-red-100 border-red-200 text-red-900"
                      : grade.percentage < 70
                        ? "bg-orange-100 border-orange-300 text-orange-800"
                        : "bg-green-100 border-green-300 text-green-800";

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-2xl shadow-2xl border ${bgColor}`}
                    >
                      <div>
                        <div className="font-lg font-bold">{grade.name}</div>
                        <div className="text-m">
                          {grade.date.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{grade.percentage.toFixed(1)}%</div>
                        <div className="text-sm">{grade.gpa.toFixed(2)} GPA</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {chartData.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow shadow">
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
      )}
    </div>
  );
}

export default UnifiedProgress;
