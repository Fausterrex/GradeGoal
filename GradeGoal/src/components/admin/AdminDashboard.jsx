import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';
import EditProfileModal from './EditProfileModal';

// Sample data arrays
const SAMPLE_DATA = {
  students: [
    { id: '1', name: 'Lynn Johnson', email: 'lynn.johnson@school.edu', joinDate: '2024-01-15', lastLogin: '2024-12-31' },
    { id: '2', name: 'Oliver Jones', email: 'oliver.jones@school.edu', joinDate: '2024-02-20', lastLogin: '2024-12-30' },
    { id: '3', name: 'Lucas Miller', email: 'lucas.miller@school.edu', joinDate: '2024-03-10', lastLogin: '2024-12-29' }
  ],
  courses: [
    { id: 'SJ1', name: 'Physics', code: 'PHY101' },
    { id: 'SJ2', name: 'Chemistry', code: 'CHE101' },
    { id: 'SJ3', name: 'English', code: 'ENG101' }
  ],
  activities: ['Quiz1', 'Activity1', 'Exam1', 'Lab1']
};

function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dashboard data with connected arrays
  const [dashboardData, setDashboardData] = useState({
    overall: { students: 0, courses: 0, completions: '0%' },
    recentActivity: [],
    historyRecords: [],
    students: {},
    courses: {}
  });

  // Add this function to handle profile updates
  const handleSaveProfileChanges = (updatedData, studentId) => {
    if (studentId) {
      // Update student profile
      setDashboardData(prev => ({
        ...prev,
        students: {
          ...prev.students,
          [studentId]: {
            ...prev.students[studentId],
            name: updatedData.name,
            email: updatedData.email,
            joinDate: updatedData.joinDate,
            lastLogin: updatedData.lastLogin
          }
        }
      }));
    } else {
      // Update admin profile (you can add admin state if needed)
      console.log('Admin profile updated:', updatedData);
      // For demo, we'll just show an alert since we don't have admin state
      alert(`Admin profile updated to: ${updatedData.firstName} ${updatedData.lastName}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchToSignup = () => navigate('/signup');
  const switchToLogin = () => navigate('/login');

  // Toggle functions
  const toggleStudent = (studentId) => {
    setActiveStudent(activeStudent === studentId ? null : studentId);
  };

  const toggleCourse = (courseId) => {
    setActiveCourse(activeCourse === courseId ? null : courseId);
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveStudent(null);
    setActiveCourse(null);
    setExpandedSubjects({});
  };

  // Edit profile handlers
  const handleEditProfile = (student = null) => {
    setEditingStudent(student);
    setShowEditProfile(true);
  };

  const closeEditProfile = () => {
    setShowEditProfile(false);
    setEditingStudent(null);
  };

  // Initialize sample data
  useEffect(() => {
    const initializeData = () => {
      // Generate students data
      const studentsData = {};
      SAMPLE_DATA.students.forEach((student, index) => {
        studentsData[student.id] = {
          user_id: student.id,
          name: student.name,
          email: student.email,
          joinDate: student.joinDate,
          lastLogin: student.lastLogin,
          progress: `${Math.floor(Math.random() * 30 + 70)}%`,
          subjects: {}
        };

        // Assign courses to students
        SAMPLE_DATA.courses.forEach((course, courseIndex) => {
          if (courseIndex === 0 || Math.random() > 0.3) { // Ensure some variety
            studentsData[student.id].subjects[course.id] = {
              course_name: course.name,
              progress: `${Math.floor(Math.random() * 25 + 75)}%`,
              activities: SAMPLE_DATA.activities.map(activity => ({
                type: activity,
                score: `${Math.floor(Math.random() * 20 + 80)}/100`,
                status: Math.random() > 0.3 ? 'completed' : 'in-progress'
              }))
            };
          }
        });
      });

      // Generate courses data
      const coursesData = {};
      SAMPLE_DATA.courses.forEach(course => {
        const enrolledStudents = SAMPLE_DATA.students.filter((_, index) => 
          studentsData[SAMPLE_DATA.students[index].id]?.subjects[course.id]
        ).map(student => student.name);

        coursesData[course.id] = {
          course_id: course.id,
          course_name: course.name,
          course_code: course.code,
          students: enrolledStudents.length,
          overallProgress: `${Math.floor(Math.random() * 25 + 75)}%`,
          activities: SAMPLE_DATA.activities.map(activity => ({
            assessment_id: `A${Math.random().toString(36).substr(2, 9)}`,
            name: activity,
            participants: Math.floor(Math.random() * 20 + 30),
            average: `${Math.floor(Math.random() * 20 + 75)}%`
          })),
          enrolled: enrolledStudents
        };
      });

      setDashboardData({
        overall: {
          students: SAMPLE_DATA.students.length,
          courses: SAMPLE_DATA.courses.length,
          completions: '61%'
        },
        recentActivity: [
          { notification_id: 1, type: 'Lynn Johnson Joined', time: '10:00 PM' },
          { notification_id: 2, type: 'Chemistry Added', time: '9/04/2025' },
          { notification_id: 3, type: 'Quiz1 Added', time: '9/02/2025' },
          { notification_id: 4, type: 'Physics Added', time: '9/01/2025' },
          { notification_id: 5, type: 'Activity1 Completed', time: '8/30/2025' },
          { notification_id: 6, type: 'Oliver Jones Joined', time: '8/28/2025' },
          { notification_id: 7, type: 'Exam1 Scheduled', time: '8/25/2025' },
          { notification_id: 8, type: 'Lab1 Added', time: '8/20/2025' },
          { notification_id: 9, type: 'Lucas Miller Joined', time: '8/15/2025' },
          { notification_id: 10, type: 'English Added', time: '8/10/2025' }
        ],
        historyRecords: [
          { record_id: 1, type: 'Lynn Johnson Joined', time: '10:00 PM' },
          { record_id: 2, type: 'Chemistry Added', time: '9/04/2025' },
          { record_id: 3, type: 'Quiz1 Added', time: '9/02/2025' },
          { record_id: 4, type: 'Physics Added', time: '9/01/2025' },
          { record_id: 5, type: 'Activity1 Completed', time: '8/30/2025' },
          { record_id: 6, type: 'Oliver Jones Joined', time: '8/28/2025' },
          { record_id: 7, type: 'Exam1 Scheduled', time: '8/25/2025' },
          { record_id: 8, type: 'Lab1 Added', time: '8/20/2025' },
          { record_id: 9, type: 'Lucas Miller Joined', time: '8/15/2025' },
          { record_id: 10, type: 'English Added', time: '8/10/2025' }
        ],
        students: studentsData,
        courses: coursesData
      });

      setLoading(false);
    };

    setLoading(true);
    // Simulate API call delay
    setTimeout(initializeData, 1000);
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#493f82]">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  // Render main dashboard
  return (
    <div className="min-h-screen flex flex-col p-4 bg-[#493f82]">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 container mx-auto">
        <LeftSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
        />
        
        <MainContent
          activeSection={activeSection}
          dashboardData={dashboardData}
          activeStudent={activeStudent}
          activeCourse={activeCourse}
          expandedSubjects={expandedSubjects}
          onToggleStudent={toggleStudent}
          onToggleCourse={toggleCourse}
          onToggleSubject={toggleSubject}
          onEditProfile={handleEditProfile}
        />
        
        <RightSidebar
          dashboardData={dashboardData}
          onLogout={handleLogout} 
        />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={closeEditProfile}
        studentData={editingStudent}
        isAdmin={!editingStudent} // If no student provided, it's admin profile
        onSaveChanges={handleSaveProfileChanges}
      />
    </div>
  );
}

export default AdminDashboard;
