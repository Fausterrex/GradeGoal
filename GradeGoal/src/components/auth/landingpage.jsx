import React from "react";
import { Link } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import accountIcon from '../../drawables/account.png';
import courseIcon from '../../drawables/course.png';
import goalIcon from '../../drawables/goal.png';
import notificationIcon from '../../drawables/notif.png';
import analyticsIcon from '../../drawables/dashboard.png';
import predictiveIcon from '../../drawables/predict.png';
import gradeIcon from '../../drawables/track.png';

export default function LandingPage() {
  // Interactive cards data for the hero section
  const cards = [
    {
      title: "Target GPA",
      value: 3,
      description: "Set your goal GPA",
      bg: "bg-white",
      cardHeaderBG: "bg-[#BFA4D0]",
    },
    {
      title: "Know your Progress",
      value: 3.25,
      description: "Updated as of August 19",
      bg: "bg-white",
      cardHeaderBG: "bg-[#92C3C4]",
    },
    {
      title: "Compute Here",
      value: "4.00+",
      description: "Calculate Your GPA",
      bg: "bg-white",
      cardHeaderBG: "bg-[#BFA4D0]"
    },
  ];

  // Feature cards data for the features section
  const features = [
    {
      title: "USER ACCOUNT MANAGEMENT",
      desc: "Secure registration and login via Firebase. Profile updates with customized characteristics and password change capabilities.",
      buttons: ["Firebase Auth", "Profile Card", "Secure"],
      icon: accountIcon,
      iconBg: "from-[#6A3EAF] to-[#3C2363]",
    },
    {
      title: "COURSE MANAGEMENT",
      desc: "Add, edit, and delete courses with percentage/letter grading structures. Gather all your enrolled courses in one place.",
      buttons: ["Grading Structure", "Flexible", "CRUD Operations"],
      icon: courseIcon,
      iconBg: "from-[#7DBA8B] to-[#39543F]",
    },
    {
      title: "GRADE INPUT & TRACKING",
      desc: "Add customized assessments per assignment/exam. Receive real-time updates by category weights, quizzes, and project grades.",
      buttons: ["Unlimited Entries", "Editable", "Real-Time"],
      icon: gradeIcon,
      iconBg: "from-[#6E52BC] to-[#8B5CF6]",
    },
    {
      title: "NOTIFICATIONS & ALERTS",
      desc: "Smart email and in-app alerts for updated assessments, feedback, and academic progress. Helps you stay on track.",
      buttons: ["Email Alerts", "Firebase FCM", "Push Notification"],
      icon: notificationIcon,
      iconBg: "from-[#AF3E82] to-[#632349]",
    },
    {
      title: "ANALYTICS DASHBOARD",
      desc: "Secure registration and login via Firebase. Profile updates with customized characteristics and password change capabilities.",
      buttons: ["Charts & Reports", "Progress Bar", "Export Reports"],
      icon: analyticsIcon,
      iconBg: "from-[#AFAB3E] to-[#636023]",
    },
    {
      title: "AI/ML PREDICTIVE ANALYTICS",
      desc: "Advanced machine learning predictions for future grades, personalized study plans, and recommendations for better outcomes.",
      buttons: ["ML Predictions", "Study Tips", "Risk Analysis"],
      icon: predictiveIcon,
      iconBg: "from-[#3EA4AF] to-[#235C63]",
    },
  ];

  return (
    <div>
      <div className="page flex flex-col items-center w-full bg-gray-50 overflow-y-auto ">
        <div className="flex flex-col md:flex-row items-center gap-0 mt-25">
          {cards.map((card, index) => {
            // Dynamic styling for each card based on position
            let rotation = "";
            let translate = "";
            let zIndex = "z-0";
            let cardSize = "w-64 h-full";
            let lift = "";

            if (index === 0) {
              rotation = "-rotate-6";
              translate = "translate-y-3";
              lift = "-mt-10";
            } else if (index === 1) {
              zIndex = "z-10";
              cardSize = "w-72 h-full;";
              lift = "-mt-20";
            } else if (index === 2) {
              rotation = "rotate-6";
              lift = "-mt-10";
              translate = "translate-y-3";
            }

            return (
              <div
                key={index}
                className={`${cardSize} p-0 m-0 rounded-4xl shadow-lg hover:shadow-xl border border-gray-300 transition-transform transform hover:-translate-y-2 flex flex-col justify-center items-center ${rotation} ${translate} ${lift} ${zIndex} ${card.bg}`}
              >
                <div className={`${card.cardHeaderBG} w-full text-center py-3 rounded-t-4xl `}>
                  <h3 className="text-gray-800 text-lg font--semibold">
                    {card.title}
                  </h3>
                </div>

                <div className="bg-white w-full rounded-xl flex flex-col items-center p-4 bg-[url('./drawables/star-background.png')] bg-cover ">
                  {index === 0 ? (
                    <>
                      <p className="text-5xl font-extrabold text-indigo-700 my-5">
                        {card.value}
                      </p>
                      <div className="w-3/4 bg-gray-200 rounded-full h-5">
                        <div
                          className=" bg-[#92C3C4] h-5 rounded-full transition-all duration-500"
                          style={{ width: `${(card.value / 4) * 100}%` }}
                        ></div>
                      </div>
                    </>
                  ) : index === 1 ? (
                    <div className="w-32 h-32">
                      <CircularProgressbar
                        value={card.value * 25}
                        text={`${card.value}`}
                        styles={buildStyles({
                          textColor: "#4338ca",
                          pathColor: "#BFA4D0",
                          trailColor: "#00000025",
                          textSize: "24px",
                          fontWeight: 700,
                          fontFamily: "Arial, sans-serif",
                          textShadow: "2px 2px 4px #000000",
                        })}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-5xl font-bold text-indigo-700 my-7">
                        {card.value}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-black font-bold my-9">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center">
          <h1 className="text-[100px] font-bold text-[#1E0E62] mt-15">
            GRADE GOAL
          </h1>
          <p className="my-4 max-w-lg text-center text-gray-600 text-[20px]">
            GradeGoal is a web-based Decision Support System that empowers students
            to achieve their academic goals through strategic planning, progress
            tracking, and intelligent guidance.
          </p>

          <Link to="/signup">
            <button className="mt-6 px-6 py-3 bg-indigo-700 text-white rounded-full shadow-lg hover:bg-indigo-800 ">
              Create an Account
            </button>
          </Link>
        </div>
      </div>

      <section className="w-full bg-white">
        <div className="w-full mx-auto px-7">
          <section className="bg-white ">
            <div className="flex items-end justify-between">
              <div className="flex items-center">
                <div className="w-32 h-32 flex items-center justify-center text-white text-2xl mx-5 mr-20 bg-[url('./drawables/logo.svg')] bg-cover bg-center">
                </div>
                <div>
                  <h2 className="text-[50px] font-bold text-[#1E0E62] flex items-center gap-2 m-8">
                    Powerful Features
                  </h2>
                  <p className="text-gray-600 max-w-md my-10 mx-3 text-[18px]">
                    Everything you need to track, analyze and improve your academic
                    performance in one comprehensive platform.
                  </p>
                </div>
              </div>
              <div className="bg-[#6E52BC] pl-6 pr-20 py-5 rounded-tl-3xl rounded-tr-none rounded-bl-none rounded-br-none shadow-md self-end">
                <h2 className="text-white italic text-5xl">Features</h2>
              </div>
            </div>
          </section>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-4 sm:px-8 lg:px-16 py-8 lg:py-10 inset-0 bg-gradient-to-br from-[#6E52BC] via-[#5A4A9C] to-[#4A3A8C] overflow-hidden gap-6">
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 p-4 sm:p-6 lg:p-10 place-items-center">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className="w-full max-w-sm sm:max-w-md rounded-3xl p-4 sm:p-6 bg-[#D8CFE5] shadow-lg hover:scale-105 transition duration-300"
                >
                  <div className="rounded-2xl shadow-md bg-white p-4 sm:p-6 text-center flex flex-col items-center justify-center h-[320px] sm:h-[360px]">
                    <div className="mb-4 sm:mb-6">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${f.iconBg} rounded-2xl flex items-center justify-center shadow-lg mx-auto`}>
                        <img src={f.icon} alt="feature icon" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                      </div>
                    </div>

                    <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-black px-2 mb-2 sm:mb-3">{f.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2 mb-4 sm:mb-6 flex-1">{f.desc}</p>

                    <div className="flex flex-col items-center gap-2 mt-auto">
                      <div className="flex gap-2">
                        {f.buttons.slice(0, 2).map((b, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-full bg-gradient-to-br from-[#6A3EAF] to-[#2C1A49] text-white text-xs sm:text-sm cursor-default shadow-sm"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                      {f.buttons.length > 2 && (
                        <div className="flex justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-gradient-to-br from-[#6A3EAF] to-[#2C1A49] text-white text-xs sm:text-sm cursor-default shadow-sm">
                            {f.buttons[2]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-sm sm:max-w-md rounded-3xl p-4 sm:p-6 bg-[#D8CFE5] shadow-lg hover:scale-105 transition duration-300">
                <div className="rounded-2xl shadow-md bg-white p-4 sm:p-6 text-center flex flex-col items-center justify-center h-[320px] sm:h-[360px]">
                  <div className="mb-4 sm:mb-6">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#58CF41] to-[#439C31] rounded-2xl flex items-center justify-center shadow-lg mx-auto`}>
                      <img src={goalIcon} alt="feature icon" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                    </div>
                  </div>

                  <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-black px-2 mb-2 sm:mb-3">GOAL SETTING</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2 mb-4 sm:mb-6 flex-1">
                    Define target grades or GPA for each course. System continuously
                    evaluates progress to meet your academic goals.
                  </p>

                  <div className="flex flex-col items-center gap-2 mt-auto">
                    <div className="flex gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-br from-[#6A3EAF] to-[#2C1A49] text-white text-xs sm:text-sm cursor-default shadow-sm">
                        Target Setting
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-br from-[#6A3EAF] to-[#2C1A49] text-white text-xs sm:text-sm cursor-default shadow-sm">
                        Add Conditions
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-br from-[#6A3EAF] to-[#2C1A49] text-white text-xs sm:text-sm cursor-default shadow-sm">
                        Auto Calculate
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-[#6E52BC] via-[#5A4A9C] to-[#4A3A8C] text-white py-16 px-4 sm:px-6 lg:px-8 mt-20 w-full">
        <div className="max-w-4xl mx-auto text-center">

          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 flex items-center justify-center">
                <div className="w-16 h-16 bg-[url('./drawables/logo.svg')] bg-cover bg-center"/>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#8168C5] to-[#BFA4D0] bg-clip-text text-transparent">
                Grade Goal
              </h2>
            </div>
            <p className="text-gray-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              GradeGoal is a web-based Decision Support System that empowers students to achieve their academic goals through strategic planning, progress tracking, and intelligent guidance.
            </p>
          </div>
        </div>

        <div className="border-t border-[#8168C5] mt-12 pt-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-200 text-sm">
              © 2024 Grade Goal. All rights reserved. | Designed with ❤️ for students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
