import React, { useState, useEffect } from "react";
import { Users, BookOpen, Target, AlertTriangle, Clock, X, Download, Calendar } from "lucide-react";

const Overview = () => {
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [overviewData, setOverviewData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    goalsCompleted: 0,
    totalGoals: 0,
    userGrowthRate: 0,
    courseGrowthRate: 0,
    goalGrowthRate: 0
  });
  const [studentsAtRisk, setStudentsAtRisk] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [dateLimits, setDateLimits] = useState({
    earliestDate: '',
    latestDate: ''
  });
  const [exportAll, setExportAll] = useState(false);

  useEffect(() => {
    fetchOverviewData();
    fetchStudentsAtRisk();
    fetchRecentActivities();
    fetchDateLimits();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const response = await fetch('/api/admin/overview');
      if (response.ok) {
        const data = await response.json();
        setOverviewData(data);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const fetchStudentsAtRisk = async () => {
    try {
      const response = await fetch('/api/admin/students-at-risk');
      if (response.ok) {
        const data = await response.json();
        setStudentsAtRisk(data);
      }
    } catch (error) {
      console.error('Error fetching students at risk:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/recent-activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDateLimits = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/export/date-limits');
      if (response.ok) {
        const data = await response.json();
        setDateLimits(data);
      }
    } catch (error) {
      console.error('Error fetching date limits:', error);
    }
  };

  const handleExportSystemOverview = async () => {
    try {
      setExportLoading(true);
      
      // Get admin user ID from context or localStorage
      const adminUserId = localStorage.getItem('userId') || '1'; // Default to 1 if not found
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('adminUserId', adminUserId);
      
      if (!exportAll) {
        if (exportDateRange.startDate) {
          params.append('startDate', exportDateRange.startDate);
        }
        if (exportDateRange.endDate) {
          params.append('endDate', exportDateRange.endDate);
        }
      }
      
      const response = await fetch(`http://localhost:8080/api/admin/export/system-overview?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to export system overview: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Generate and download PDF
      await generateAndDownloadPDF(data);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export system overview: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  const generateAndDownloadPDF = async (data) => {
    // Create a comprehensive HTML document
    const htmlContent = generateHTMLReport(data);
    
    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print/save as PDF
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const generateHTMLReport = (data) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>GradeGoal System Overview Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 12px; }
            .section { margin-bottom: 25px; }
            .section h2 { margin: 20px 0 10px 0; font-size: 18px; }
            .section h3 { margin: 15px 0 8px 0; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
            .table th, .table td { border: 1px solid #000; padding: 6px; text-align: left; }
            .table th { background-color: #f0f0f0; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; }
            @media print { body { margin: 15px; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>GradeGoal System Overview Report</h1>
            <p>Generated on: ${currentDate} at ${currentTime}</p>
            <p>Report Period: ${data.reportPeriod}</p>
            <p>System Version: ${data.systemVersion}</p>
        </div>

        <div class="section">
            <h2>User Analytics</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Total Registered Users</td><td>${data.userAnalytics.totalRegistered}</td></tr>
                    <tr><td>Active Users</td><td>${data.userAnalytics.activeUsers}</td></tr>
                    <tr><td>Inactive Users</td><td>${data.userAnalytics.inactiveUsers}</td></tr>
                    <tr><td>Frozen Users</td><td>${data.userAnalytics.frozenUsers}</td></tr>
                    <tr><td>Currently Logged In</td><td>${data.userAnalytics.currentlyLoggedIn}</td></tr>
                    <tr><td>Users with Courses</td><td>${data.userAnalytics.usersWithCourses}</td></tr>
                    <tr><td>Users without Courses</td><td>${data.userAnalytics.usersWithoutCourses}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Course Analytics</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Total Courses</td><td>${data.courseAnalytics.totalCourses}</td></tr>
                    <tr><td>Active Courses</td><td>${data.courseAnalytics.activeCourses}</td></tr>
                    <tr><td>Archived Courses</td><td>${data.courseAnalytics.archivedCourses}</td></tr>
                    <tr><td>Courses at Risk</td><td>${data.courseAnalytics.coursesAtRisk}</td></tr>
                    <tr><td>Courses with Goals</td><td>${data.courseAnalytics.coursesWithGoals}</td></tr>
                    <tr><td>Courses without Goals</td><td>${data.courseAnalytics.coursesWithoutGoals}</td></tr>
                    <tr><td>Courses with Achieved Goals</td><td>${data.courseAnalytics.coursesWithAchievedGoals}</td></tr>
                    <tr><td>Courses with Goals in Progress</td><td>${data.courseAnalytics.coursesWithGoalsInProgress}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>AI System Analytics</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>AI System Used</td><td>${data.aiAnalytics.aiSystemUsed}</td></tr>
                    <tr><td>AI Model Information</td><td>${data.aiAnalytics.aiModelInfo}</td></tr>
                    <tr><td>Users Who Used AI</td><td>${data.aiAnalytics.usersWhoUsedAI}</td></tr>
                    <tr><td>Users Who Never Used AI</td><td>${data.aiAnalytics.usersWhoNeverUsedAI}</td></tr>
                    <tr><td>Total AI Usage</td><td>${data.aiAnalytics.totalAIUsage}</td></tr>
                    <tr><td>Last AI Usage</td><td>${data.aiAnalytics.lastAIUsage === 'Never' ? 'Never' : new Date(data.aiAnalytics.lastAIUsage).toLocaleString()}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Achievement Analytics</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Total Achievements</td><td>${data.achievementAnalytics.totalAchievements}</td></tr>
                    <tr><td>Total Unlocked</td><td>${data.achievementAnalytics.totalUnlocked}</td></tr>
                </tbody>
            </table>
            
            <h3>Achievements by Rarity</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Rarity</th>
                        <th>Number of Achievements</th>
                        <th>Users Who Earned</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(data.achievementAnalytics.achievementsByRarity).map(([rarity, count]) => `
                        <tr>
                            <td>${rarity}</td>
                            <td>${count}</td>
                            <td>${data.achievementAnalytics.usersByRarity[rarity] || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>System Logs</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Total Log Entries</td><td>${data.systemLogs.totalLogEntries}</td></tr>
                </tbody>
            </table>
            
            <h3>Recent Activities (Last 25)</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>User ID</th>
                        <th>Activity Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.systemLogs.recentActivities.map(activity => `
                        <tr>
                            <td>${new Date(activity.timestamp).toLocaleString()}</td>
                            <td>${activity.userId}</td>
                            <td>${activity.activityType}</td>
                            <td>${activity.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>This report was generated automatically by the GradeGoal System</p>
            <p>For questions or support, please contact the system administrator</p>
        </div>
    </body>
    </html>
    `;
  };

  return (
    
    <div className="p-10 bg-[#D4C5F5] min-h-auto w-11/12 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#3C2363]">Overview</h1>
        </div>
        
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 bg-[#3C2363] text-white px-4 py-2 rounded-lg hover:bg-[#2a1a4a] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              <p className="font-medium text-gray-600">Total Users</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">
              {loading ? '...' : overviewData.totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${overviewData.activeUsers.toLocaleString()} active`}
            </p>
          </div>
          <span className="text-green-600 font-semibold">
            {loading ? '...' : `+${overviewData.userGrowthRate.toFixed(1)}%`}
          </span>
        </div>


        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-purple-600" size={20} />
              <p className="font-medium text-gray-600">Active Courses</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">
              {loading ? '...' : overviewData.activeCourses.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${overviewData.totalCourses.toLocaleString()} total`}
            </p>
          </div>
          <span className="text-green-600 font-semibold">
            {loading ? '...' : `+${overviewData.courseGrowthRate.toFixed(1)}%`}
          </span>
        </div>


        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="text-green-600" size={20} />
              <p className="font-medium text-gray-600">Goals Completed</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">
              {loading ? '...' : `${((overviewData.goalsCompleted / overviewData.totalGoals) * 100).toFixed(1)}%`}
            </p>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${overviewData.goalsCompleted.toLocaleString()} / ${overviewData.totalGoals.toLocaleString()}`}
            </p>
          </div>
          <span className="text-green-600 font-semibold">
            {loading ? '...' : `+${overviewData.goalGrowthRate.toFixed(1)}%`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students at Risk */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Students at Risk</h2>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading students at risk...</p>
              </div>
            ) : studentsAtRisk.length > 0 ? (
              studentsAtRisk.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-orange-50 px-4 py-2 rounded-lg"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.courses} courses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-semibold">{s.percent.toFixed(1)}%</p>
                    <p className="text-xs text-red-500">{s.trend.toFixed(1)}% trend</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No students at risk found.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading recent activities...</p>
              </div>
            ) : activities.length > 0 ? (
              activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <div className="text-blue-600">{a.icon}</div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{a.text}</p>
                    <p className="text-xs text-gray-500">{a.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent activities found.</p>
            )}
          </div>
        </div>
      </div>

{showModal && (
  <div className="fixed inset-0  backdrop-blur-lg flex justify-center items-center z-50">
    <div className=" bg-white border border-white rounded-xl shadow-2xl w-[90%] max-w-2xl p-6 relative text-white">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-4 right-4 text-black hover:text-gray-500"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-black">
        <AlertTriangle className="text-red-300" size={22} />
        All Students at Risk
      </h2>

      <div className="overflow-y-auto max-h-80">
        {studentsAtRisk.length > 0 ? (
          studentsAtRisk.map((s, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-lg mb-2"
            >
              <div>
                <p className="text-black font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">{s.courses} courses</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-600 font-semibold">{s.percent.toFixed(1)}%</p>
                <p className="text-xs text-red-400">{s.trend.toFixed(1)}% trend</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No students at risk found.</p>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowModal(false)}
          className="bg-[#3C2363] text-white px-4 py-2 rounded-lg hover:bg-[#5a3699]"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* Export Modal */}
{showExportModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#3C2363]">Export System Overview</h2>
        <button
          onClick={() => setShowExportModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="exportAll"
            checked={exportAll}
            onChange={(e) => {
              setExportAll(e.target.checked);
              if (e.target.checked) {
                setExportDateRange({ startDate: '', endDate: '' });
              }
            }}
            className="w-4 h-4 text-[#3C2363] border-gray-300 rounded focus:ring-[#3C2363]"
          />
          <label htmlFor="exportAll" className="text-sm font-medium text-gray-700">
            Export All Data (Ignore Date Range)
          </label>
        </div>
        
        {!exportAll && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={exportDateRange.startDate}
                min={dateLimits.earliestDate}
                max={dateLimits.latestDate}
                onChange={(e) => setExportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C2363]"
              />
              {dateLimits.earliestDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Earliest data available: {new Date(dateLimits.earliestDate).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={exportDateRange.endDate}
                min={exportDateRange.startDate || dateLimits.earliestDate}
                max={dateLimits.latestDate}
                onChange={(e) => setExportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C2363]"
              />
              {dateLimits.latestDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Latest data available: {new Date(dateLimits.latestDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </>
        )}
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> {exportAll 
              ? "This will export all available data from the system." 
              : "Select a date range to filter the export data, or leave empty to export all data."
            } The report will include comprehensive system analytics, user statistics, course data, AI usage, and achievement information.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setShowExportModal(false)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleExportSystemOverview}
          disabled={exportLoading}
          className="flex items-center gap-2 bg-[#3C2363] text-white px-4 py-2 rounded-lg hover:bg-[#2a1a4a] disabled:opacity-50"
        >
          {exportLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Report
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Overview;