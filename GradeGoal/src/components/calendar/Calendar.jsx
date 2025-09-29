// Calendar.jsx
import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar"; 
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {

  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month"); 
  const [date, setDate] = useState(new Date()); 
  const MyToolbar = ({ label, onNavigate, onView }) => (
  <div className="h-30 flex justify-between items-center p-4 bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white rounded-t-2xl">
    <h2 className="text-4xl font-semibold ml-2">Calendar</h2>
    <div className="flex items-center gap-2">
      <button onClick={() => onNavigate("TODAY")} className="bg-gray-300 text-black px-2 rounded">Today</button>
      <button onClick={() => onNavigate("PREV")} className="bg-gray-300 text-black px-2 rounded">Back</button>
      <button onClick={() => onNavigate("NEXT")} className="bg-gray-300 text-black px-2 rounded">Next</button>
      <span className="mx-2 font-semibold">{label}</span>
      {["month","week","day","agenda"].map(v => (
        <button key={v} onClick={() => onView(v)} className="bg-gray-300 text-black px-2 rounded">{v.charAt(0).toUpperCase() + v.slice(1)}</button>
      ))}
    </div>
  </div>
);
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/assessments")
      .then((res) => {
        const formatted = res.data.map((item) => ({
          id: item.assessmentId,
          title: item.assessmentName,
          start: new Date(item.dueDate),
          end: new Date(item.dueDate),
        }));
        setEvents(formatted);
      })
      .catch((err) => console.error(err));
  }, []);


  const eventStyleGetter = (event) => {
    const now = new Date();
    const start = new Date(event.start);
    const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24)); 

    let backgroundColor = "green"; // 1 week above deadline
    if (diffDays < 0) {
      backgroundColor = "red"; // past due
    } else if (diffDays <= 3) {
      backgroundColor = "orange"; // upcoming 3 days / priority
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "5px",
        border: "none",
        padding: "2px",
      },
    };
  };

  return (
  <div className="relative w-full border border-gray-300 shadow-2xl rounded-2xl flex flex-col">

    {/* Fixed Toolbar */}
    <MyToolbar className="sticky"
      label={moment(date).format("MMMM DD — YYYY")}
      onNavigate={(action) => {
        if (action === "TODAY") setDate(new Date());
        else if (action === "NEXT") setDate(moment(date).add(1, view === "month" ? "months" : view === "week" ? "weeks" : "days").toDate());
        else if (action === "PREV") setDate(moment(date).subtract(1, view === "month" ? "months" : view === "week" ? "weeks" : "days").toDate());
      }}
      onView={(newView) => setView(newView)}
    />

    {/* Calendar */}
    <BigCalendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={["month", "week", "day", "agenda"]}
      view={view}
      onView={setView}
      date={date}
      onNavigate={setDate}
      style={{ height: "75vh" }} 
      eventPropGetter={eventStyleGetter}
      toolbar={false} 
    />
  </div>
);

};

export default MyCalendar; // ✅ export new name
