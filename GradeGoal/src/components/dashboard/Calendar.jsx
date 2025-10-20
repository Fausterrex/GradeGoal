// Calendar.jsx
import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar"; 
import moment from "moment";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useYearLevel } from "../context/YearLevelContext";
import CustomEventModal from "../modals/CustomEventModal";
import { auth } from "../../backend/firebase";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Minimal CSS overrides for react-big-calendar positioning
const calendarStyles = `
  .rbc-month-view .rbc-date-cell .rbc-events-container {
    position: absolute !important;
    top: 20px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    max-height: 95px !important;
    z-index: 1 !important;
  }
  
  .rbc-date-cell .rbc-date {
    z-index: 2 !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = calendarStyles;
  document.head.appendChild(styleSheet);
}

const localizer = momentLocalizer(moment);

// Custom Event Component with Tailwind classes
const EventComponent = ({ event }) => {
  return (
    <div className="flex flex-col gap-0.5 w-full h-full px-1.5 py-1 justify-center overflow-hidden">
      <div className="text-[10px] font-bold opacity-95 overflow-hidden text-ellipsis whitespace-nowrap uppercase tracking-wide leading-tight">
        {event.courseName}
      </div>
      <div className="text-[11px] font-semibold leading-tight overflow-hidden text-ellipsis whitespace-nowrap m-0">
        {event.title}
      </div>
    </div>
  );
};

const MyCalendar = () => {
  const { currentUser, loading } = useAuth();
  const { filterDataByYearLevel, selectedYearLevel } = useYearLevel();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month"); 
  const [date, setDate] = useState(new Date());
  const [showCustomEventModal, setShowCustomEventModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Helper function to get Firebase auth headers
  const getAuthHeaders = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return {
      'Content-Type': 'application/json'
    };
  };

  const MyToolbar = ({ label, onNavigate, onView }) => (
    <div className="h-auto md:h-auto flex flex-col md:flex-col justify-between items-center gap-6 md:gap-6 p-6 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] text-white rounded-t-2xl shadow-2xl relative overflow-hidden">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-bold tracking-wide">Academic Calendar</h2>
            <p className="text-white/80 text-sm font-medium">Track your assessments and deadlines</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCustomEventModal(true)}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm text-sm border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl"
        >
          + Quick Add
        </button>
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 backdrop-blur-sm border border-white/20">
          <button 
            onClick={() => onNavigate("TODAY")} 
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm hover:scale-105 shadow-md"
          >
            Today
          </button>
          <button 
            onClick={() => onNavigate("PREV")} 
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm hover:scale-105 shadow-md"
          >
            ←
          </button>
          <button 
            onClick={() => onNavigate("NEXT")} 
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm hover:scale-105 shadow-md"
          >
            →
          </button>
        </div>
        
        <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/20">
          <span className="font-bold text-lg tracking-wide">{label}</span>
        </div>
        
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 backdrop-blur-sm border border-white/20">
          {["month","week","day","agenda"].map(v => (
            <button 
              key={v} 
              onClick={() => onView(v)} 
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm hover:scale-105 shadow-md capitalize"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  useEffect(() => {
    const fetchCalendarData = async () => {
      // Don't fetch if auth is still loading or no user
      if (loading || !currentUser?.userId) {
        setEvents([]); // Clear previous data
        return;
      }

      setIsLoading(true);

      try {
        // Fetch both assessments and custom events with auth headers
        const headers = await getAuthHeaders();
        const [assessmentsRes, customEventsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/assessments/user/${currentUser.userId}`, { headers }),
          axios.get(`http://localhost:8080/api/custom-events/user/${currentUser.userId}`, { headers })
        ]);
        
        // Format assessments for calendar with course information
        const assessmentEvents = assessmentsRes.data.map((item) => {
        const now = new Date();
        const dueDate = new Date(item.dueDate);
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        // Determine status - prioritize backend status, fallback to date logic
        let status = "UPCOMING";
        if (item.status && (item.status === "OVERDUE" || item.status === "UPCOMING" || item.status === "COMPLETED")) {
          status = item.status;
        } else {
          // Fallback to date-based logic
          if (diffDays < 0) {
            status = "OVERDUE";
          } else {
            status = "UPCOMING";
          }
        }

        return {
          id: item.assessmentId,
          title: item.assessmentName,
          courseName: item.courseName,
          start: new Date(item.dueDate),
          end: new Date(item.dueDate),
          status: status,
          description: item.description,
          categoryName: item.categoryName,
          maxPoints: item.maxPoints,
        };
      });

      // Format custom events for calendar
      const customEvents = customEventsRes.data.map((item) => {
        return {
          id: `custom-${item.eventId}`,
          title: item.eventTitle,
          courseName: 'Custom Event',
          start: new Date(item.eventStart),
          end: new Date(item.eventEnd),
          status: 'CUSTOM',
          description: item.eventDescription,
          categoryName: 'Personal',
          maxPoints: null,
          isCustomEvent: true
        };
      });
      
      // Combine all events
      const allEvents = [...assessmentEvents, ...customEvents];
      
      // Filter events by year level (assessment events have course info, custom events show for all)
      
      const filteredEvents = allEvents.filter(event => {
        // Custom events are shown for all year levels
        if (event.isCustomEvent) {
          return true;
        }
        
        // For assessment events, we need to fetch course data to filter by year level
        // For now, show all assessment events - TODO: implement course filtering based on year level
        return true;
      });
      
        
        setEvents(filteredEvents);
      } catch (err) {
        console.error("Calendar: Failed to fetch calendar data:", err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentUser?.userId, loading]);

  // Reload calendar data when year level changes
  useEffect(() => {
    const reloadCalendarData = async () => {
      if (currentUser?.userId && !loading) {
        // Trigger the same data loading logic
        setIsLoading(true);

        try {
          const headers = await getAuthHeaders();
          const [assessmentsRes, customEventsRes] = await Promise.all([
            axios.get(`http://localhost:8080/api/assessments/user/${currentUser.userId}`, { headers }),
            axios.get(`http://localhost:8080/api/custom-events/user/${currentUser.userId}`, { headers })
          ]);
          
          // Format assessments for calendar with course information
          const assessmentEvents = assessmentsRes.data.map((item) => {
          const now = new Date();
          const dueDate = new Date(item.dueDate);
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          
          // Determine status - prioritize backend status, fallback to date logic
          let status = "UPCOMING";
          if (item.status && (item.status === "OVERDUE" || item.status === "UPCOMING" || item.status === "COMPLETED")) {
            status = item.status;
          } else {
            // Fallback to date-based logic
            if (diffDays < 0) {
              status = "OVERDUE";
            } else {
              status = "UPCOMING";
            }
          }

          return {
            id: item.assessmentId,
            title: item.assessmentName,
            courseName: item.courseName,
            start: new Date(item.dueDate),
            end: new Date(item.dueDate),
            status: status,
            description: item.description,
            categoryName: item.categoryName,
            maxPoints: item.maxPoints,
          };
        });

        // Format custom events for calendar
        const customEvents = customEventsRes.data.map((item) => {
          return {
            id: `custom-${item.eventId}`,
            title: item.eventTitle,
            courseName: 'Custom Event',
            start: new Date(item.eventStart),
            end: new Date(item.eventEnd),
            status: 'CUSTOM',
            description: item.eventDescription,
            categoryName: 'Personal',
            maxPoints: null,
            isCustomEvent: true
          };
        });
        
        // Combine and filter all events
        const allEvents = [...assessmentEvents, ...customEvents];
        
        
        const filteredEvents = allEvents.filter(event => {
          // Custom events are shown for all year levels
          if (event.isCustomEvent) {
            return true;
          }
          
          // For assessment events, filter based on year level
          // Note: The calendar API doesn't include course year level info directly
          // So we'll show all assessment events for now
          return true;
        });
          
          setEvents(filteredEvents);
        } catch (err) {
          console.error("Calendar: Failed to reload calendar data:", err);
          setEvents([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    reloadCalendarData();
  }, [selectedYearLevel]);

  const handleCustomEventAdded = (newEvent) => {
    // Add the new custom event to the events list
    const customEvent = {
      id: `custom-${newEvent.eventId}`,
      title: newEvent.eventTitle,
      courseName: 'Custom Event',
      start: new Date(newEvent.eventStart),
      end: new Date(newEvent.eventEnd),
      status: 'CUSTOM',
      description: newEvent.eventDescription,
      categoryName: 'Personal',
      maxPoints: null,
      isCustomEvent: true
    };
    
    setEvents(prevEvents => [...prevEvents, customEvent]);
  };

  // Handle event click - show event details
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Handle custom event deletion
  const handleDeleteCustomEvent = async (eventId) => {
    if (!currentUser?.userId) return;

    try {
      const headers = await getAuthHeaders();
      
      // Extract the actual event ID from the custom event ID format
      const actualEventId = eventId.replace('custom-', '');
      
      await axios.delete(`http://localhost:8080/api/custom-events/${actualEventId}`, { headers });
      
      // Remove the event from the local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      // Close the modal
      setShowEventModal(false);
      setSelectedEvent(null);
      
      alert('Custom event deleted successfully!');
    } catch (error) {
      console.error('Error deleting custom event:', error);
      alert('Failed to delete custom event. Please try again.');
    }
  };

  const eventStyleGetter = (event) => {
    const now = new Date();
    const start = new Date(event.start);
    const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24)); 

    let backgroundColor = "#2196F3"; // Default: Blue for upcoming
    let borderColor = "transparent";
    let statusLabel = "";

    // Use assessment status for styling - OVERDUE, UPCOMING, COMPLETED, and CUSTOM
    if (event.status) {
      switch (event.status) {
        case "OVERDUE":
          backgroundColor = "#F44336"; // Red
          break;
        case "COMPLETED":
          backgroundColor = "#4CAF50"; // Green
          break;
        case "CUSTOM":
          backgroundColor = "#9C27B0"; // Purple for custom events
          break;
        case "UPCOMING":
        default:
          backgroundColor = "#2196F3"; // Blue for upcoming
          break;
      }
    } else {
      // Fallback to date-based logic
      if (diffDays < 0) {
        backgroundColor = "#F44336"; // Red - past due
      } else {
        backgroundColor = "#2196F3"; // Blue - upcoming
      }
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "8px",
        border: `2px solid ${borderColor}`,
        padding: "6px 8px",
        fontSize: "11px",
        fontWeight: "600",
        margin: "2px 0", // Add spacing between events
        minHeight: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
      },
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <MyToolbar className="sticky"
          label={moment(date).format("MMMM DD — YYYY")}
          onNavigate={() => {}} // Disabled during loading
          onView={() => {}} // Disabled during loading
        />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading user data...</span>
        </div>
      </div>
    );
  }

  // Show no user state
  if (!currentUser?.userId) {
    return (
      <div className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <MyToolbar className="sticky"
          label={moment(date).format("MMMM DD — YYYY")}
          onNavigate={() => {}} // Disabled when no user
          onView={() => {}} // Disabled when no user
        />
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Please log in to view your calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
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

      {/* Loading overlay for data fetching */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading calendar data...</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex justify-around my-5 p-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl text-white shadow-2xl">
        <div className="text-center">
          <div className="text-2xl font-extrabold mb-1.5 text-shadow-sm">{events.filter(e => e.status === "OVERDUE").length}</div>
          <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">Overdue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold mb-1.5 text-shadow-sm">{events.filter(e => e.status === "UPCOMING").length}</div>
          <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">Upcoming</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold mb-1.5 text-shadow-sm">{events.filter(e => e.status === "COMPLETED").length}</div>
          <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold mb-1.5 text-shadow-sm">{events.filter(e => e.status === "CUSTOM").length}</div>
          <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">Custom Events</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold mb-1.5 text-shadow-sm">{events.length}</div>
          <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">Total</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 my-5 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <div className="w-3.5 h-3.5 rounded shadow-sm" style={{backgroundColor: "#F44336"}}></div>
          <span>Overdue Assessments</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <div className="w-3.5 h-3.5 rounded shadow-sm" style={{backgroundColor: "#2196F3"}}></div>
          <span>Upcoming Assessments</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <div className="w-3.5 h-3.5 rounded shadow-sm" style={{backgroundColor: "#4CAF50"}}></div>
          <span>Completed Assessments</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <div className="w-3.5 h-3.5 rounded shadow-sm" style={{backgroundColor: "#9C27B0"}}></div>
          <span>Custom Events</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
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
          onSelectEvent={handleEventClick}
          components={{
            event: EventComponent
          }}
          toolbar={false}
        />
      </div>

      {/* Custom Event Modal */}
      <CustomEventModal
        isOpen={showCustomEventModal}
        onClose={() => setShowCustomEventModal(false)}
        onEventAdded={handleCustomEventAdded}
      />

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedEvent.isCustomEvent ? 'Custom Event' : 'Assessment Details'}
                </h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
                  <p className="text-lg font-medium text-gray-800">{selectedEvent.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Course</label>
                  <p className="text-gray-800">{selectedEvent.courseName}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Date & Time</label>
                  <p className="text-gray-800">
                    {moment(selectedEvent.start).format('MMMM DD, YYYY [at] h:mm A')}
                  </p>
                </div>

                {selectedEvent.description && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                    <p className="text-gray-800">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.categoryName && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                    <p className="text-gray-800">{selectedEvent.categoryName}</p>
                  </div>
                )}

                {selectedEvent.maxPoints && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Max Points</label>
                    <p className="text-gray-800">{selectedEvent.maxPoints}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEvent.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    selectedEvent.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    selectedEvent.status === 'CUSTOM' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                {selectedEvent.isCustomEvent && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this custom event?')) {
                        handleDeleteCustomEvent(selectedEvent.id);
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Delete Event
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default MyCalendar; // ✅ export new name
