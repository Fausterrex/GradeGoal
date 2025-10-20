
import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  TrendingUp,
  Search,
  User,
  Settings,
  Lock,
  Power,
} from "lucide-react";
import dummyProfile from "../../../drawables/dummyProfile.webp";
import { getAllUsers } from "../../../backend/adminAPI";
import { auth } from "../../../backend/firebase";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [userProgressData, setUserProgressData] = useState({});
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return { 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      
      // Fetch progress data for all users
      await fetchUserProgressData(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setToast("Failed to fetch users ⚠️");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgressData = async (usersList) => {
    try {
      const headers = await getAuthHeaders();
      const progressPromises = usersList
        .filter(user => user.role !== 'ADMIN')
        .map(async (user) => {
          try {
            const [progressResponse, streakResponse] = await Promise.all([
              fetch(`/api/user-progress/${user.userId}/with-gpas`, { headers }),
              fetch(`/api/users/${user.userId}/streak`, { headers })
            ]);

            const progressData = progressResponse.ok ? await progressResponse.json() : null;
            const streakData = streakResponse.ok ? await streakResponse.json() : null;

            return {
              userId: user.userId,
              progress: progressData,
              streak: streakData
            };
          } catch (error) {
            console.warn(`Failed to fetch progress for user ${user.userId}:`, error);
            return {
              userId: user.userId,
              progress: null,
              streak: null
            };
          }
        });

      const progressResults = await Promise.all(progressPromises);
      const progressMap = {};
      progressResults.forEach(result => {
        progressMap[result.userId] = result;
      });
      setUserProgressData(progressMap);
    } catch (error) {
      console.error("Error fetching user progress data:", error);
    }
  };

  const filteredUsers = users
    .filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((user) => user.role !== "ADMIN");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedUser((prev) => ({
        ...prev,
        profilePictureUrl: reader.result, // store as base64 temporarily
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFreezeAccount = async (e) => {
    const freeze = e.target.checked; // true = frozen
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/users/freeze/${selectedUser.userId}?freeze=${freeze}`,
        { method: "PUT", headers }
      );

      if (response.ok) {
        const updated = await response.json();
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === updated.userId ? { ...u, isActive: updated.isActive } : u
          )
        );
        setSelectedUser((prev) => ({ ...prev, isActive: updated.isActive }));

        // ✅ show toast
        setToast(
          freeze
            ? "Account frozen successfully ❄️"
            : "Account reactivated ✅"
        );
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Failed to update account status ⚠️");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Error freezing account:", error);
      setToast("Something went wrong ⚠️");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatYearLevel = (level) => {
    switch (level) {
      case "1":
        return "1st Year";
      case "2":
        return "2nd Year";
      case "3":
        return "3rd Year";
      case "4":
        return "4th Year";
      default:
        return level || "1st Year";
    }
  };

  const calculateGrowthRate = () => {
    // Calculate growth rate based on user registration dates
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    
    const usersLastMonth = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= lastMonth && createdAt < now;
    }).length;
    
    const usersTwoMonthsAgo = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= twoMonthsAgo && createdAt < lastMonth;
    }).length;
    
    if (usersTwoMonthsAgo === 0) return 0;
    return ((usersLastMonth - usersTwoMonthsAgo) / usersTwoMonthsAgo * 100).toFixed(1);
  };

  const getUserProgressInfo = (userId) => {
    const progressInfo = userProgressData[userId];
    if (!progressInfo) {
      return {
        currentGPA: 0.0,
        semesterGPA: 0.0,
        streakDays: 0,
        rankTitle: "Beginner Scholar"
      };
    }

    const progress = progressInfo.progress;
    const streak = progressInfo.streak;

    return {
      currentGPA: progress?.cumulativeGpa || 0.0,
      semesterGPA: progress?.semesterGpa || 0.0,
      streakDays: streak?.streakDays || 0,
      rankTitle: progress?.currentLevel ? getRankTitle(progress.currentLevel) : "Beginner Scholar"
    };
  };

  const getRankTitle = (level) => {
    if (level >= 20) return "Legendary Scholar";
    if (level >= 15) return "Master Scholar";
    if (level >= 10) return "Advanced Scholar";
    if (level >= 5) return "Intermediate Scholar";
    return "Beginner Scholar";
  };

  const handleSaveChanges = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/users/profile/${selectedUser.userId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            email: selectedUser.email,
            profilePictureUrl: selectedUser.profilePictureUrl,
            currentYearLevel: selectedUser.currentYearLevel,
          }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setUsers((prev) =>
          prev.map((u) => (u.userId === updated.userId ? updated : u))
        );
        setSelectedUser(null);
        setToast("User updated successfully ✅");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Failed to update user ⚠️");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setToast("Something went wrong ⚠️");
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="p-10 bg-[#D4C5F5] min-h-auto w-11/12 mx-auto flex flex-col gap-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <p className="text-gray-800 font-medium">{toast}</p>
        </div>
      )}
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#3C2363] mb-8">User Management</h1>
        <div className="relative w-full md:w-full">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-600">
              <Users size={20} />
              <p className="font-medium text-gray-600">Total Registered</p>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {users.filter((u) => u.role !== "ADMIN").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck size={20} />
              <p className="font-medium text-gray-600">Active This Month</p>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {users.filter((u) => u.isActive && u.role !== "ADMIN").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-purple-600">
              <TrendingUp size={20} />
              <p className="font-medium text-gray-600">Growth Rate</p>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {loading ? '...' : `+${calculateGrowthRate()}%`}
            </p>
            <p className="text-sm text-gray-500">vs last month</p>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <div
              key={user.userId}
              onClick={() => setSelectedUser(user)}
              className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <User size={22} className="text-gray-600" />
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${user.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                  ></span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <p className="text-gray-700">{formatYearLevel(user.currentYearLevel)}</p>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500 py-6">No users found.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[80%] max-w-5xl p-8 border-2 border-[#3C2363] relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✖
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side */}
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h2 className="text-lg font-semibold text-[#3C2363] flex items-center gap-2 mb-4">
                  <User className="text-[#3C2363]" /> Account Information
                </h2>

                <div className="flex flex-col items-center">
                  <img
                    src={selectedUser.profilePictureUrl || dummyProfile}
                    alt="Profile"
                    className="w-28 h-28 rounded-full mb-3 object-cover border-2 border-[#3C2363]"
                  />
                  <label className="bg-[#3C2363] text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-[#5a3699]">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <label className="text-sm text-gray-600">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    value={selectedUser.firstName || ""}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 text-gray-800"
                  />

                  <label className="text-sm text-gray-600">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={selectedUser.lastName || ""}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 text-gray-800"
                  />

                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={selectedUser.email || ""}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 text-gray-800"
                  />

                  <label className="text-sm text-gray-600">
                    Current Academic Year Level
                  </label>
                  <select
                    name="currentYearLevel"
                    value={selectedUser.currentYearLevel || ""}
                    onChange={handleInputChange}
                    className="border rounded-lg px-3 py-2 text-gray-800"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveChanges}
                    className="bg-[#3C2363] text-white px-4 py-2 rounded-lg hover:bg-[#5a3699]"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Right Side - Admin Control */}
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h2 className="text-lg font-semibold text-[#3C2363] flex items-center gap-2 mb-4">
                  <Settings className="text-[#3C2363]" /> Admin Control
                </h2>

                {/* Freeze Account */}
                <div className="flex items-center justify-between bg-[#F8F6FD] px-4 py-3 rounded-lg border border-[#3C2363]/20 mb-4">
                  <p className="text-[#3C2363] font-medium">Freeze Account</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!selectedUser.isActive}
                      onChange={handleFreezeAccount}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3C2363]"></div>
                  </label>
                </div>

                {/* Progress Section */}
                <div className="bg-[#F8F6FD] border border-[#3C2363]/20 rounded-lg p-5 mt-3">
                  <p className="text-[#3C2363] font-semibold text-lg">
                    {getUserProgressInfo(selectedUser.userId).rankTitle}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current GPA</p>
                      <p className="text-xl font-bold text-[#3C2363]">
                        {getUserProgressInfo(selectedUser.userId).currentGPA.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Semester GPA</p>
                      <p className="text-xl font-bold text-[#3C2363]">
                        {getUserProgressInfo(selectedUser.userId).semesterGPA.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Streak</p>
                      <p className="text-xl font-bold text-[#3C2363]">
                        {getUserProgressInfo(selectedUser.userId).streakDays} Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

