import React from "react";
import { Link } from "react-router-dom"; // ✅ Import Link
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function GPASection() {
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
      value: 2,
      description: "Updated as of Nov 20",
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
  return (
    
    <div className="page flex flex-col items-center justify-center h-screen w-full bg-gray-50">
      {/* Cards Section */}
      <div className="flex flex-col md:flex-row items-center gap-0">
        {cards.map((card, index) => {
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
              className={`${cardSize} p-0 m-0 rounded-2xl shadow-lg hover:shadow-xl border border-gray-300 transition-transform transform hover:-translate-y-2 flex flex-col justify-center items-center ${rotation} ${translate} ${lift} ${zIndex} ${card.bg}`}
            >
              
          <div className={`${card.cardHeaderBG} w-full text-center py-3 rounded-t-2xl `}>
            <h3 className="text-white text-lg font-semibold">
              {card.title}
            </h3>
          </div>

              <div className="bg-white w-full rounded-xl flex flex-col items-center p-4 bg-[url('./drawables/star-background.png')] bg-cover bg-cover ">
                {index === 0 ? (
                  <>
                    {/* Progress Bar */}
                    <p className="text-2xl font-bold text-indigo-700 my-5">
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
                    {/* Cirle Progress Bar */}
                    <CircularProgressbar
                      value={card.value * 25}
                      text={`${card.value} ` }
                      styles={buildStyles({
                        textColor: "#4338ca",
                        pathColor: "#BFA4D0",
                        trailColor: "#e5e7eb",
                      })}
                    />
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-indigo-700 my-7">
                    {card.value}
                  </p>
                )}
              </div>
              <p className="text-black font-bold my-9">{card.description}</p>
            </div>
          );
        })}
      </div>
  
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-7xl font-extrabold text-indigo-900  mt-20">
        GRADE GOAL
      </h1>
      <p className="my-8 max-w-lg text-center text-xl text-gray-600">
        GradeGoal is a web-based Decision Support System that empowers students
        to achieve their academic goals through strategic planning, progress
        tracking, and intelligent guidance.
      </p>

      <Link to="/signup">
        <button className="mt-6 px-6 py-3 bg-indigo-700 text-white rounded-full shadow-2xl hover:bg-indigo-800 ">
          Create an Account
        </button>
      </Link>
     </div>
    </div>
  );
}
