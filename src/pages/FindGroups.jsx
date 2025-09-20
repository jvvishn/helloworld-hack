import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import LoadingState from "../components/UI/LoadingState";
import EmptyState from "../components/UI/EmptyState";
import ScheduleSetup from "../components/Schedule/ScheduleSetup";
import scheduleService from "../services/scheduleService";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const FindGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: "",
    timeOfDay: "",
    groupSize: "",
    availability: "all",
  });
  const [userSchedule, setUserSchedule] = useState(null);
  const [showScheduleSetup, setShowScheduleSetup] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Mock groups data with schedule information
  const mockGroups = [
    {
      id: "cs101-advanced",
      name: "CS 101 - Advanced Study Group",
      subject: "Computer Science",
      description:
        "Deep dive into data structures and algorithms. Perfect for students wanting extra practice.",
      members: 3,
      maxMembers: 5,
      meetingTimes: [
        { day: "tuesday", startTime: "14:00", endTime: "16:00" },
        { day: "thursday", startTime: "14:00", endTime: "16:00" },
      ],
      location: "Library Study Room B",
      difficulty: "Intermediate",
      tags: ["Algorithms", "Data Structures", "Programming"],
      organizer: "Sarah Chen",
      rating: 4.8,
      isCompatible: true,
    },
    {
      id: "math205-calculus",
      name: "Calculus II Problem Solving",
      subject: "Mathematics",
      description:
        "Work through challenging calculus problems together. Integration techniques and series.",
      members: 2,
      maxMembers: 4,
      meetingTimes: [
        { day: "monday", startTime: "19:00", endTime: "20:30" },
        { day: "wednesday", startTime: "19:00", endTime: "20:30" },
      ],
      location: "Math Building Room 305",
      difficulty: "Advanced",
      tags: ["Integration", "Series", "Applications"],
      organizer: "Mike Johnson",
      rating: 4.6,
      isCompatible: true,
    },
    {
      id: "phys101-lab",
      name: "Physics Lab Prep Group",
      subject: "Physics",
      description:
        "Prepare for weekly physics labs and review concepts before experiments.",
      members: 4,
      maxMembers: 6,
      meetingTimes: [{ day: "sunday", startTime: "15:00", endTime: "17:00" }],
      location: "Science Building Lobby",
      difficulty: "Beginner",
      tags: ["Lab Prep", "Experiments", "Mechanics"],
      organizer: "Emma Wilson",
      rating: 4.4,
      isCompatible: false,
    },
    {
      id: "chem201-organic",
      name: "Organic Chemistry Study Circle",
      subject: "Chemistry",
      description:
        "Master organic chemistry reactions and mechanisms through collaborative learning.",
      members: 5,
      maxMembers: 5,
      meetingTimes: [
        { day: "tuesday", startTime: "18:00", endTime: "20:00" },
        { day: "friday", startTime: "16:00", endTime: "18:00" },
      ],
      location: "Chemistry Building Room 201",
      difficulty: "Advanced",
      tags: ["Reactions", "Mechanisms", "Synthesis"],
      organizer: "Alex Rivera",
      rating: 4.9,
      isCompatible: false,
      isFull: true,
    },
  ];

  useEffect(() => {
    loadGroups();
    checkUserSchedule();
  }, []);

  const checkUserSchedule = () => {
    const { schedule, source } = scheduleService.getUserSchedule();
    setUserSchedule(schedule);

    if (!schedule) {
      setShowScheduleSetup(true);
    }
  };

  const loadGroups = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Filter and sort groups based on schedule compatibility
      const processedGroups = mockGroups.map((group) => ({
        ...group,
        isCompatible: checkScheduleCompatibility(group),
      }));

      setGroups(processedGroups);
    } catch (error) {
      showError("Failed to load study groups");
      console.error("Load groups error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkScheduleCompatibility = (group) => {
    if (!userSchedule) return false;

    return group.meetingTimes.some((meetingTime) => {
      return scheduleService.isTimeSlotAvailable(
        meetingTime.day,
        meetingTime.startTime,
        meetingTime.endTime
      );
    });
  };

  const handleScheduleComplete = (schedule) => {
    setUserSchedule(schedule);
    setShowScheduleSetup(false);
    showSuccess("Schedule saved! Now showing compatible groups.");
    loadGroups(); // Reload groups with compatibility check
  };

  const handleJoinGroup = (groupId) => {
    showSuccess(
      "Join request sent! The group organizer will review your application."
    );
    // In real app, would make API call to join group
  };

  const filteredGroups = groups.filter((group) => {
    if (filters.subject && group.subject !== filters.subject) return false;
    if (filters.availability === "compatible" && !group.isCompatible)
      return false;
    if (filters.availability === "open" && group.isFull) return false;
    return true;
  });

  const getCompatibilityBadge = (group) => {
    if (!userSchedule) return null;

    if (group.isCompatible) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Compatible Schedule
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Schedule Conflict
        </span>
      );
    }
  };

  const formatMeetingTimes = (meetingTimes) => {
    return meetingTimes
      .map(
        (time) =>
          `${time.day.charAt(0).toUpperCase() + time.day.slice(1)} ${
            time.startTime
          }-${time.endTime}`
      )
      .join(", ");
  };

  if (loading) {
    return (
      <LoadingState message="Finding compatible study groups..." fullScreen />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Study Groups
        </h1>
        <p className="text-gray-600 mb-6">
          Discover study groups that match your schedule and learning goals
        </p>

        {/* Schedule Status */}
        {userSchedule ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-green-800 font-medium">
                  Schedule connected
                </span>
                <span className="text-green-600">
                  - Showing compatible groups
                </span>
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowScheduleSetup(true)}
              >
                Update Schedule
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-blue-800 font-medium">
                  Add your schedule to see compatible groups
                </span>
              </div>
              <Button size="small" onClick={() => setShowScheduleSetup(true)}>
                Add Schedule
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              value={filters.availability}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  availability: e.target.value,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Groups</option>
              <option value="compatible">Compatible with My Schedule</option>
              <option value="open">Open to New Members</option>
            </select>
          </div>
        </div>
      </div>

      {/* Groups List */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          title="No groups found"
          description="Try adjusting your filters or create a new study group"
          actionLabel="Create New Group"
          onAction={() => console.log("Create group")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="p-6 h-fit">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {group.description}
                  </p>
                </div>
                <div className="ml-4">{getCompatibilityBadge(group)}</div>
              </div>

              {/* Group Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="text-gray-600">{group.subject}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{group.difficulty}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-gray-600">
                    {group.members}/{group.maxMembers} members
                  </span>
                  {group.isFull && (
                    <span className="text-red-600 text-xs font-medium">
                      (Full)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-600">
                    {formatMeetingTimes(group.meetingTimes)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-600">{group.location}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-gray-600">{group.rating} rating</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">by {group.organizer}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link to={`/group/${group.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Button
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={group.isFull}
                  className="flex-1"
                >
                  {group.isFull ? "Group Full" : "Request to Join"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Setup Modal */}
      <ScheduleSetup
        isOpen={showScheduleSetup}
        onClose={() => setShowScheduleSetup(false)}
        onComplete={handleScheduleComplete}
      />
    </div>
  );
};

export default FindGroups;
