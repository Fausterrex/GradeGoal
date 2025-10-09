import React from "react";
import { Trophy } from "lucide-react";

const Gamification = () => {
  const achievements = [
    {
      title: "Grade Entry Rookie",
      desc: "Enter your first 5 grades. (COMMON)",
      progress: 10230,
      total: 12487,
      color: "bg-blue-500",
    },
    {
      title: "A+ Student",
      desc: "Achieve a grade of 95% or higher. (UNCOMMON)",
      progress: 7400,
      total: 12487,
      color: "bg-blue-400",
    },
    {
      title: "Dean’s List",
      desc: "Achieve a semester GPA of 3.5+. (RARE)",
      progress: 4800,
      total: 12487,
      color: "bg-yellow-400",
    },
    {
      title: "Perfect Scholar",
      desc: "Achieve a perfect 4.0 GPA target. (LEGENDARY)",
      progress: 1100,
      total: 12487,
      color: "bg-yellow-500",
    },
    {
      title: "Goal Setter",
      desc: "Create your first academic goal. (COMMON)",
      progress: 8900,
      total: 12487,
      color: "bg-blue-500",
    },
    {
      title: "Goal Crusher",
      desc: "Achieve your first academic goal. (UNCOMMON)",
      progress: 4200,
      total: 12487,
      color: "bg-green-500",
    },
    {
      title: "Streak Starter",
      desc: "Maintain a 3-day login streak. (COMMON)",
      progress: 6600,
      total: 12487,
      color: "bg-purple-500",
    },
    {
      title: "Consistency King",
      desc: "Maintain a 30-day login streak. (RARE)",
      progress: 2200,
      total: 12487,
      color: "bg-yellow-400",
    },
    {
      title: "Improvement Champion",
      desc: "Improve your grade by 10+ points. (UNCOMMON)",
      progress: 3900,
      total: 12487,
      color: "bg-green-500",
    },
    {
      title: "Ultimate Achiever",
      desc: "Earn 100 different achievements. (LEGENDARY)",
      progress: 900,
      total: 12487,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="p-8  min-h-auto min-w-11/12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-[#3C2363]">Achievement Overview</h1>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#E67E22] font-semibold">🏅 Common</p>
          <p className="text-sm text-gray-500">42% of users earned</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#1ABC9C] font-semibold">🟢 Uncommon</p>
          <p className="text-sm text-gray-500">28% of users earned</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#E74C3C] font-semibold">🔴 Rare</p>
          <p className="text-sm text-gray-500">18% of users earned</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#F1C40F] font-semibold">🟡 Epic</p>
          <p className="text-sm text-gray-500">8% of users earned</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#9B59B6] font-semibold">🟣 Legendary</p>
          <p className="text-sm text-gray-500">4% of users earned</p>
        </div>
      </div>


      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          Achievement Progress Overview
        </h2>

        <div className="space-y-5">
          {achievements.map((a, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>{a.title}</span>
                <span>
                  {a.progress.toLocaleString()} / {a.total.toLocaleString()} users
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${a.color} h-3 rounded-full`}
                  style={{
                    width: `${(a.progress / a.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Achievements</p>
        <p className="text-3xl font-bold text-gray-800">34,521</p>
        <p className="text-sm text-gray-500">Unlocked</p>
      </div>
    </div>
  );
};

export default Gamification;
