import { useState } from "react";
const MainContent = ({ 
  activeSection, 
  dashboardData, 
  activeStudent, 
  activeCourse, 
  expandedSubjects, 
  onToggleStudent, 
  onToggleCourse, 
  onToggleSubject,
  onEditProfile,
  onAccountStatusChange 
}) => {
  return (
    <main className="flex-1 min-w-0">
      <div className="bg-white rounded-xl shadow-sm p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
        {activeSection === 'dashboard' && <DashboardView dashboardData={dashboardData} />}
        {activeSection === 'students' && (
          <StudentsView 
            dashboardData={dashboardData}
            activeStudent={activeStudent}
            expandedSubjects={expandedSubjects}
            onToggleStudent={onToggleStudent}
            onToggleSubject={onToggleSubject}
            onEditProfile={onEditProfile}
            onAccountStatusChange={onAccountStatusChange}
          />
        )}
        {activeSection === 'courses' && (
          <CoursesView 
            dashboardData={dashboardData}
            activeCourse={activeCourse}
            onToggleCourse={onToggleCourse}
          />
        )}
      </div>
    </main>
  );
};

const DashboardView = ({ dashboardData }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{dashboardData.overall.students}</div>
          <div className="text-gray-600 text-sm">Overall Students</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{dashboardData.overall.courses}</div>
          <div className="text-gray-600 text-sm">Overall Courses</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{dashboardData.overall.completions}</div>
          <div className="text-gray-600 text-sm">Overall Completions</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="max-h-64 overflow-y-auto space-y-3">
          {dashboardData.recentActivity.map((activity) => (
            <div
              key={activity.notification_id}
              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type.includes('Student') ? 'bg-green-500' : 
                  activity.type.includes('Course') ? 'bg-blue-500' : 
                  activity.type.includes('Quiz') ? 'bg-purple-500' : 
                  'bg-yellow-500'
                }`}></div>
                <span className="text-gray-800 font-medium">{activity.type}</span>
              </div>
              <span className="text-gray-500 text-sm font-medium">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

const StudentsView = ({ 
  dashboardData, 
  activeStudent, 
  expandedSubjects, 
  onToggleStudent, 
  onToggleSubject,
  onEditProfile,
  onAccountStatusChange 
}) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800">Students</h3>
    <div className="flex flex-col gap-4">
      {Object.entries(dashboardData.students).map(([studentId, studentData]) => (
        <StudentCard
          key={studentId}
          studentId={studentId}
          studentData={studentData}
          isActive={activeStudent === studentId}
          expandedSubjects={expandedSubjects}
          onToggleStudent={onToggleStudent}
          onToggleSubject={onToggleSubject}
          onEditProfile={onEditProfile}
          onAccountStatusChange={onAccountStatusChange}
        />
      ))}
    </div>
  </div>
);

const StudentCard = ({ 
  studentId, 
  studentData, 
  isActive, 
  expandedSubjects, 
  onToggleStudent, 
  onToggleSubject,
  onEditProfile,
  onAccountStatusChange 
}) => (
  <div className="flex flex-col">
    <div
      onClick={() => onToggleStudent(studentId)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${
        isActive
          ? 'border-pink-300 bg-pink-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {studentData.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-medium text-gray-800 text-lg">{studentData.name}</div>
          <div className="text-sm text-gray-600">
            {isActive ? 'Hide details' : 'Click to View Details'}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-pink-600">{studentData.progress}</div>
        <div className="text-xs text-gray-500">Overall Progress</div>
      </div>
    </div>
    {isActive && (
      <StudentDetails 
        studentData={studentData} 
        studentId={studentId}
        expandedSubjects={expandedSubjects}
        onToggleSubject={onToggleSubject}
        onEditProfile={onEditProfile}
        onAccountStatusChange={onAccountStatusChange}
      />
    )}
  </div>
);

const StudentDetails = ({ studentData, studentId, expandedSubjects, onToggleSubject, onEditProfile, onAccountStatusChange }) => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-lg p-6 animate-fadeIn">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'courses'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Student Courses
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'status'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Status
        </button>
      </div>

      {activeTab === 'profile' && (
        <ProfileTab 
          studentData={studentData} 
          studentId={studentId}
          onEditProfile={onEditProfile} 
          onAccountStatusChange={onAccountStatusChange}
        />
      )}
      
      {activeTab === 'courses' && (
        <CoursesTab 
          studentData={studentData} 
          studentId={studentId}
          expandedSubjects={expandedSubjects}
          onToggleSubject={onToggleSubject}
        />
      )}
      
      {activeTab === 'status' && (
        <StatusTab studentData={studentData} />
      )}
    </div>
  );
};

const ProfileTab = ({ studentData, studentId, onEditProfile, onAccountStatusChange }) => (
  <div className="space-y-6">
    {/* Header with Edit Button */}
    <div className="flex justify-between items-start">
      <h4 className="text-xl font-semibold text-gray-800">Profile Details</h4>
      <button
        onClick={() => onEditProfile(studentData)}
        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <span>✏️</span>
        <span>Edit Profile</span>
      </button>
    </div>

    {/* Profile Information Grid */}
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
          <div className="text-lg text-gray-800 font-medium">{studentData.name.split(' ')[0]}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
          <div className="text-lg text-gray-800 font-medium">{studentData.name.split(' ')[1] || 'N/A'}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
          <div className="text-lg text-gray-800 font-medium">{studentData.user_id}</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <div className="text-lg text-gray-800 font-medium">{studentData.email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Join Date</label>
          <div className="text-lg text-gray-800 font-medium">
            {studentData.joinDate ? new Date(studentData.joinDate).toLocaleDateString() : '12/31/2024'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Last Login</label>
          <div className="text-lg text-gray-800 font-medium">
            {studentData.lastLogin ? new Date(studentData.lastLogin).toLocaleDateString() : '12/31/2024'}
          </div>
        </div>
      </div>
    </div>

    {/* Security Actions */}
    <div className="border-t border-gray-200 pt-6">
      <h5 className="font-semibold text-gray-800 mb-4">Security Actions</h5>
      <div className="flex space-x-4">
        <button className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium">
          Change Password
        </button>
        <button 
          onClick={() => onAccountStatusChange(studentId, !studentData.isActive)}
          className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
            studentData.isActive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {studentData.isActive ? 'Freeze Account' : 'Unfreeze Account'}
        </button>
      </div>
      {studentData.isActive === false && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            ⚠️ This account is currently frozen. The user will be notified when they try to log in.
          </p>
        </div>
      )}
    </div>
  </div>
);

const CoursesTab = ({ studentData, studentId, expandedSubjects, onToggleSubject }) => (
  <div className="space-y-4">
    <h4 className="text-xl font-semibold text-gray-800 mb-4">Enrolled Courses</h4>
    <div className="space-y-3">
      {Object.entries(studentData.subjects).map(([courseId, courseData]) => (
        <div key={courseId} className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
            onClick={() => onToggleSubject(`${studentId}-${courseId}`)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-800 text-lg">{courseData.course_name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-green-600">{courseData.progress}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform ${
                  expandedSubjects[`${studentId}-${courseId}`] ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {expandedSubjects[`${studentId}-${courseId}`] && (
            <div className="p-4 bg-white border-t border-gray-200">
              <h5 className="font-medium text-gray-700 mb-3 text-lg">Activities & Assessments</h5>
              <div className="space-y-3">
                {courseData.activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="text-gray-800 font-medium">{activity.type}</span>
                      <span className={`ml-3 text-sm px-2 py-1 rounded-full ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {activity.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const StatusTab = ({ studentData }) => (
  <div className="space-y-6">
    <h4 className="text-xl font-semibold text-gray-800">Student Status</h4>
    
    {/* Overall Progress */}
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-semibold text-gray-800 text-lg">Overall Academic Progress</h5>
        <span className="text-2xl font-bold text-blue-600">{studentData.progress}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" 
          style={{ width: studentData.progress }}
        ></div>
      </div>
    </div>

    {/* Course-wise Progress */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(studentData.subjects).map(([courseId, courseData]) => (
        <div key={courseId} className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h6 className="font-medium text-gray-800">{courseData.course_name}</h6>
            <span className="text-lg font-bold text-green-600">{courseData.progress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: courseData.progress }}
            ></div>
          </div>
        </div>
      ))}
    </div>

    {/* Activity Summary */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h5 className="font-semibold text-gray-800 mb-3">Activity Summary</h5>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {Object.values(studentData.subjects).reduce((acc, course) => 
              acc + course.activities.filter(a => a.status === 'completed').length, 0
            )}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-600">
            {Object.values(studentData.subjects).reduce((acc, course) => 
              acc + course.activities.filter(a => a.status === 'in-progress').length, 0
            )}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {Object.values(studentData.subjects).reduce((acc, course) => 
              acc + course.activities.length, 0
            )}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>
    </div>
  </div>
);

const CoursesView = ({ dashboardData, activeCourse, onToggleCourse }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800">Courses</h3>
    <div className="flex flex-col gap-4">
      {Object.entries(dashboardData.courses).map(([courseId, courseData]) => (
        <div key={courseId} className="flex flex-col">
          <div
            onClick={() => onToggleCourse(courseId)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${
              activeCourse === courseId
                ? 'border-pink-300 bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <div className="font-medium text-gray-800">{courseData.course_name}</div>
              <div className="text-sm text-gray-600">
                {activeCourse === courseId ? 'Hide details' : 'View details'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{courseData.students} Students</div>
              <div className="text-sm text-green-600 font-medium">{courseData.overallProgress}</div>
            </div>
          </div>
          {activeCourse === courseId && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4 animate-fadeIn">
              <h4 className="font-semibold text-gray-800 mb-3">{courseData.course_name} - Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Activities</h5>
                  <div className="space-y-3">
                    {courseData.activities.map((activity) => (
                      <div
                        key={activity.assessment_id}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="font-medium text-gray-800">{activity.name}</div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>Participants: {activity.participants}</span>
                          <span>Average: {activity.average}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Enrolled Students</h5>
                  <div className="space-y-2">
                    {courseData.enrolled.map((student, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-gray-50 rounded flex justify-between items-center"
                      >
                        <span className="text-gray-700">{student}</span>
                        <span className="text-green-600 text-sm font-medium">
                          {dashboardData.students[Object.keys(dashboardData.students).find(
                            key => dashboardData.students[key].name === student
                          )]?.progress || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default MainContent;