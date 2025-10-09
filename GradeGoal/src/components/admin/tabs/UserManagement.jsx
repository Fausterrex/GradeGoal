import React, { useState } from "react";
import { Users, UserCheck, TrendingUp, Search, User, Settings, Lock } from "lucide-react";
import dummyProfile from "../../../drawables/dummyProfile.webp";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "johnDoe@gmail.com", level: 1, date: "10/20/2025", active: true },
    { id: 2, name: "Jane Smith", email: "janeSmith@gmail.com", level: 2, date: "10/19/2025", active: true },
    { id: 3, name: "Mike Chen", email: "mikeChen@gmail.com", level: 1, date: "10/18/2025", active: true },
    { id: 4, name: "Sarah Johnson", email: "sarahJ@gmail.com", level: 3, date: "10/17/2025", active: false },
    { id: 5, name: "Emily Rodriguez", email: "emilyR@gmail.com", level: 1, date: "10/15/2025", active: true },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.level).includes(searchTerm)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === selectedUser.id ? selectedUser : u))
    );
    setSelectedUser(null);
  };

  return (
    <div className="p-10 bg-[#D4C5F5] min-h-auto w-11/12 mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#3C2363] mb-8">User Management</h1>
        <div className="relative w-full md:w-full">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-600">
              <Users size={20} />
              <p className="font-medium text-gray-600">Total Registered</p>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-1">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck size={20} />
              <p className="font-medium text-gray-600">Active This Month</p>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {users.filter((u) => u.active).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-purple-600">
              <TrendingUp size={20} />
              <p className="font-medium text-gray-600">Growth Rate</p>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-1">+12.5%</p>
            <p className="text-sm text-gray-500">vs last month</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 p-2 rounded-full">
                  <User size={22} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <p className="text-gray-700">{user.level}</p>
                <p className="text-gray-700">{user.date}</p>
                <div
                  className={`h-3 w-3 rounded-full ${user.active ? "bg-green-500" : "bg-red-400"}`}
                ></div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500 py-6">No users found.</p>
          )}
        </div>
      </div>

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
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h2 className="text-lg font-semibold text-[#3C2363] flex items-center gap-2 mb-4">
                  <User className="text-[#3C2363]" /> Account Information
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center">
                    <img src={dummyProfile} alt="Profile" className="w-20 h-20 rounded-full" />
                    <div className="flex flex-col ml-5">
                      <p className="text-black text-lg font-semibold">Profile Picture</p>
                      <button className="mt-2 px-3 py-1 bg-[#7A5AF8] text-white rounded-lg text-sm">
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={selectedUser.email}
                      onChange={handleInputChange}
                      className="border rounded-lg px-3 py-2 text-gray-800"
                    />

                    <label className="text-sm text-gray-600">Display Name</label>
                    <input
                      name="name"
                      type="text"
                      value={selectedUser.name}
                      onChange={handleInputChange}
                      className="border rounded-lg px-3 py-2 text-gray-800"
                    />

                    <label className="text-sm text-gray-600">Username</label>
                    <input
                      name="username"
                      type="text"
                      value={selectedUser.username || selectedUser.name.replace(" ", "").toLowerCase()}
                      onChange={handleInputChange}
                      className="border rounded-lg px-3 py-2 text-gray-800"
                    />

                    <label className="text-sm text-gray-600">Current Academic Year Level</label>
                    <select
                      name="level"
                      value={selectedUser.level}
                      onChange={handleInputChange}
                      className="border rounded-lg px-3 py-2 text-gray-800"
                    >
                      <option value={"1st Year"}>1st Year</option>
                      <option value={"2nd Year"}>2nd Year</option>
                      <option value={"3rd Year"}>3rd Year</option>
                      <option value={"4th Year"}>4th Year</option>
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
              </div>

              {/* Right Panel - Admin Control */}
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h2 className="text-lg font-semibold text-[#3C2363] flex items-center gap-2 mb-4">
                  <Settings className="text-[#3C2363]" /> Admin Control
                </h2>

                <div className="flex items-center justify-between bg-yellow-100 px-4 py-3 rounded-lg mb-6">
                  <div className="flex items-center gap-2 text-yellow-700 font-medium">
                    <Lock size={18} /> Freeze Account
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="bg-indigo-50 rounded-xl p-5 text-center">
                  <p className="text-sm text-[#3C2363] font-medium">Beginner Scholar</p>
                  <p className="text-3xl font-bold text-[#3C2363] mt-1">135</p>
                  <p className="text-sm text-red-500">+65 points to next level</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mt-6">
                  <div>
                    <p className="text-xl font-bold text-gray-800">{selectedUser.level}</p>
                    <p className="text-sm text-gray-500">Level</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">1.0</p>
                    <p className="text-sm text-gray-500">Day Streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">0.00</p>
                    <p className="text-sm text-gray-500">Cumulative GPA</p>
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
