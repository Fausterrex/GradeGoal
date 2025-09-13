// ========================================
// TREND INDICATORS COMPONENT
// ========================================
// Comprehensive trend analysis with visual indicators

import React, { useMemo } from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function TrendIndicators({ grades, categories, course }) {
  // Calculate various trends
  const trendAnalysis = useMemo(() => {
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
        return {
          date: new Date(grade.date),
          percentage,
          gpa: convertPercentageToGPA(percentage, course.gpaScale || "4.0"),
          name: grade.name,
          category: grade.categoryId
        };
      })
      .sort((a, b) => a.date - b.date);

    if (allGrades.length < 2) {
      return {
        overall: { direction: 'stable', strength: 0, description: 'Insufficient data' },
        recent: { direction: 'stable', strength: 0, description: 'Insufficient data' },
        categoryTrends: [],
        consistency: { score: 0, description: 'Insufficient data' }
      };
    }

    // Overall trend (comparing first half vs second half)
    const midPoint = Math.floor(allGrades.length / 2);
    const firstHalf = allGrades.slice(0, midPoint);
    const secondHalf = allGrades.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.percentage, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.percentage, 0) / secondHalf.length;
    const overallChange = secondHalfAvg - firstHalfAvg;
    
    // Recent trend (last 3 vs previous 3)
    const recentGrades = allGrades.slice(-3);
    const previousGrades = allGrades.slice(-6, -3);
    
    let recentChange = 0;
    if (previousGrades.length > 0 && recentGrades.length > 0) {
      const recentAvg = recentGrades.reduce((sum, item) => sum + item.percentage, 0) / recentGrades.length;
      const previousAvg = previousGrades.reduce((sum, item) => sum + item.percentage, 0) / previousGrades.length;
      recentChange = recentAvg - previousAvg;
    }

    // Category trends
    const categoryTrends = categories.map(category => {
      const categoryGrades = allGrades.filter(grade => grade.category === category.id);
      if (categoryGrades.length < 2) return null;
      
      const mid = Math.floor(categoryGrades.length / 2);
      const firstHalf = categoryGrades.slice(0, mid);
      const secondHalf = categoryGrades.slice(mid);
      
      const firstAvg = firstHalf.reduce((sum, item) => sum + item.percentage, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, item) => sum + item.percentage, 0) / secondHalf.length;
      const change = secondAvg - firstAvg;
      
      return {
        categoryId: category.id,
        categoryName: category.name,
        direction: change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable',
        strength: Math.abs(change),
        change: change
      };
    }).filter(Boolean);

    // Consistency score (standard deviation)
    const allPercentages = allGrades.map(grade => grade.percentage);
    const mean = allPercentages.reduce((sum, val) => sum + val, 0) / allPercentages.length;
    const variance = allPercentages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allPercentages.length;
    const standardDeviation = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - standardDeviation); // Higher score = more consistent

    const getTrendDirection = (change) => {
      if (change > 2) return 'improving';
      if (change < -2) return 'declining';
      return 'stable';
    };

    const getTrendDescription = (direction, strength) => {
      const strengthText = strength > 5 ? 'significantly' : strength > 2 ? 'moderately' : 'slightly';
      switch (direction) {
        case 'improving': return `${strengthText} improving`;
        case 'declining': return `${strengthText} declining`;
        default: return 'stable';
      }
    };

    return {
      overall: {
        direction: getTrendDirection(overallChange),
        strength: Math.abs(overallChange),
        description: getTrendDescription(getTrendDirection(overallChange), Math.abs(overallChange)),
        change: overallChange
      },
      recent: {
        direction: getTrendDirection(recentChange),
        strength: Math.abs(recentChange),
        description: getTrendDescription(getTrendDirection(recentChange), Math.abs(recentChange)),
        change: recentChange
      },
      categoryTrends,
      consistency: {
        score: consistencyScore,
        description: consistencyScore > 80 ? 'Very Consistent' : 
                    consistencyScore > 60 ? 'Moderately Consistent' : 
                    consistencyScore > 40 ? 'Somewhat Variable' : 'Highly Variable'
      }
    };
  }, [grades, categories, course.gpaScale]);

  const TrendCard = ({ title, trend, icon }) => (
    <div className="bg-white p-6 rounded border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <div className="px-3 py-1 rounded border border-gray-300 text-xs font-semibold bg-gray-50 text-gray-700">
          {trend.direction.toUpperCase()}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1 text-gray-900">{trend.strength.toFixed(1)}%</div>
      <div className="text-sm text-gray-600">{trend.description}</div>
      {trend.change !== undefined && (
        <div className="text-xs text-gray-500 mt-2">
          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}% change
        </div>
      )}
    </div>
  );

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving':
        return <span className="text-lg">📈</span>;
      case 'declining':
        return <span className="text-lg">📉</span>;
      default:
        return <span className="text-lg">➡️</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Performance Trends
          </h3>
        </div>
      </div>

      {/* Main Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrendCard
          title="Overall Trend"
          trend={trendAnalysis.overall}
          icon={getTrendIcon(trendAnalysis.overall.direction)}
        />
        
        <TrendCard
          title="Recent Trend"
          trend={trendAnalysis.recent}
          icon={getTrendIcon(trendAnalysis.recent.direction)}
        />
        
        <div className="bg-white p-6 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">📊</span>
              <h4 className="font-semibold text-gray-900">Consistency</h4>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1 text-gray-900">{trendAnalysis.consistency.score.toFixed(0)}%</div>
          <div className="text-sm text-gray-600">{trendAnalysis.consistency.description}</div>
        </div>
      </div>

      {/* Category Trends */}
      {trendAnalysis.categoryTrends.length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Trends</h4>
          <div className="space-y-3">
            {trendAnalysis.categoryTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded border">
                <div className="flex items-center gap-3">
                  {getTrendIcon(trend.direction)}
                  <div>
                    <div className="font-medium text-gray-900">{trend.categoryName}</div>
                    <div className="text-sm text-gray-600">{trend.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-600">
                    {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">change</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Summary */}
      <div className="bg-gray-50 rounded border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Trend Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Overall Performance: </span>
            <span className="font-semibold text-gray-600">
              {trendAnalysis.overall.description}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Recent Performance: </span>
            <span className="font-semibold text-gray-600">
              {trendAnalysis.recent.description}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Grade Consistency: </span>
            <span className="font-semibold text-gray-600">{trendAnalysis.consistency.description}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Data Points: </span>
            <span className="font-semibold text-gray-600">{Object.values(grades).flat().filter(g => g.score).length} assessments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendIndicators;
