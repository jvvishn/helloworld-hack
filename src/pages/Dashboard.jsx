import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";

import { useEffect, useState } from "react";
import WelcomeModal from "../components/Onboarding/WelcomeModal";
import TutorialOverlay from "../components/Onboarding/TutorialOverlay";
import useTutorial from "../hooks/useTutorial";

import ScheduleSetup from "../components/Schedule/ScheduleSetup";
import scheduleService from "../services/scheduleService";
import { useNotification } from "../contexts/NotificationContext";
import ChecklistView from "../components/Checklist/ChecklistView";

const Dashboard = ({ user }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showScheduleSetup, setShowScheduleSetup] = useState(false);
  const [userSchedule, setUserSchedule] = useState(null);
  const [scheduleSource, setScheduleSource] = useState("none");

  const dashboardTutorial = useTutorial("dashboard");
  const { showSuccess } = useNotification();

  // Check if user needs onboarding
  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem(
        "hasCompletedOnboarding"
      );
      if (!hasCompletedOnboarding) {
        setShowWelcome(true);
      }

      // Check schedule status
      const { schedule, source } = scheduleService.getUserSchedule();
      setUserSchedule(schedule);
      setScheduleSource(source);
    }
  }, [user]);

  // Handle welcome completion
  const handleWelcomeComplete = (preferences) => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    setShowWelcome(false);

    // Start dashboard tutorial after welcome
    setTimeout(() => {
      dashboardTutorial.startTutorial();
    }, 500);
  };

  // Handle schedule completion
  const handleScheduleComplete = (schedule) => {
    setUserSchedule(schedule);
    setScheduleSource(scheduleService.getUserSchedule().source);
    setShowScheduleSetup(false);
    showSuccess("Schedule saved! Now you can find compatible study groups.");
  };

  // Tutorial steps for dashboard
  const tutorialSteps = [
    {
      target: '[data-tutorial="stats"]',
      title: "Your Study Stats",
      description:
        "Here you can see an overview of your study groups, sessions, and performance metrics.",
    },
    {
      target: '[data-tutorial="schedule"]',
      title: "Schedule Status",
      description:
        "Keep track of your schedule setup to find compatible study times with other students.",
    },
    {
      target: '[data-tutorial="groups"]',
      title: "My Study Groups",
      description:
        'This section shows all your active study groups. Click "Join" to enter a group session.',
    },
    {
      target: '[data-tutorial="sessions"]',
      title: "Upcoming Sessions",
      description:
        "Keep track of your scheduled study sessions and never miss an important session.",
    },
    {
      target: '[data-tutorial="actions"]',
      title: "Quick Actions",
      description:
        "Use these buttons to quickly create groups, find new study partners, or schedule sessions.",
    },
    {
      target: '[data-tutorial="demo"]',
      title: "Try Real-time Features",
      description:
        "Test our chat and whiteboard features! These work in real-time with your study partners.",
    },
  ];

  return (
    <>
      <div className="space-y-6 lg:space-y-8 px-4 lg:px-0">
        {/* Welcome Section */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Here's what's happening with your study groups today.
          </p>

          {/* Tutorial trigger button */}
          <div className="mt-2">
            <button
              onClick={dashboardTutorial.startTutorial}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Take a tour of your dashboard
            </button>
          </div>
        </div>
        {/* Schedule Status */}
        <div data-tutorial="schedule">
          {userSchedule ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
                    Schedule connected (
                    {scheduleSource === "google" ? "Google Calendar" : "Manual"}
                    )
                  </span>
                  <span className="text-green-600">
                    - {userSchedule.classes?.length || 0} classes tracked
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                    Add your schedule to find compatible study groups
                  </span>
                </div>
                <Button size="small" onClick={() => setShowScheduleSetup(true)}>
                  Add Schedule
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Quick Stats */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          data-tutorial="stats"
        >
          <Card>
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-blue-600">
                3
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Active Groups
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                12
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Study Sessions
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-purple-600">
                8
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Study Partners
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-orange-600">
                4.2
              </div>
              <div className="text-xs lg:text-sm text-gray-600">
                Avg. Rating
              </div>
            </div>
          </Card>
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* My Groups */}
          <Card className="h-fit" data-tutorial="groups">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                My Study Groups
              </h2>
              <Link to="/groups">
                <Button size="small" className="sm:w-auto">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {[
                {
                  name: "CS 101 - Data Structures",
                  members: 4,
                  nextSession: "Today, 3:00 PM",
                },
                {
                  name: "MATH 205 - Calculus II",
                  members: 3,
                  nextSession: "Tomorrow, 2:00 PM",
                },
                {
                  name: "PHYS 101 - Mechanics",
                  members: 5,
                  nextSession: "Wednesday, 4:00 PM",
                },
              ].map((group, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm lg:text-base">
                      {group.name}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      {group.members} members • {group.nextSession}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    className="sm:ml-4 w-full sm:w-auto"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="h-fit" data-tutorial="sessions">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Upcoming Sessions
              </h2>
              <Button size="small" className="sm:w-auto">
                Schedule New
              </Button>
            </div>
            <div className="space-y-3">
              {[
                {
                  subject: "Data Structures Review",
                  time: "Today, 3:00 PM",
                  location: "Library Room 201",
                },
                {
                  subject: "Calculus Problem Set",
                  time: "Tomorrow, 2:00 PM",
                  location: "Online",
                },
                {
                  subject: "Physics Lab Prep",
                  time: "Wednesday, 4:00 PM",
                  location: "Science Building",
                },
              ].map((session, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm lg:text-base truncate">
                      {session.subject}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      {session.time}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.location}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/groups" className="w-full">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-blue-600"
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
                <span className="text-sm font-medium">My Groups</span>
              </Button>
            </Link>

            <Link to="/find-groups" className="w-full">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Find Groups</span>
              </Button>
            </Link>

            <Link to="/study-materials" className="w-full">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span className="text-sm font-medium">AI Study Tools</span>
              </Button>
            </Link>

            <Link to="/checklists" className="w-full">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6m-6 4h6"
                  />
                </svg>
                <span className="text-sm font-medium">My Checklists</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
            >
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7m-6 0h6"
                />
              </svg>
              <span className="text-sm font-medium">Schedule</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-pink-50 hover:border-pink-300 transition-colors"
            >
              <svg
                className="w-8 h-8 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">Notes</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-teal-50 hover:border-teal-300 transition-colors"
            >
              <svg
                className="w-8 h-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span className="text-sm font-medium">Flashcards</span>
            </Button>

            <Link to="/settings" className="w-full">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Settings</span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Real-time Features Demo */}
        <div className="bg-blue-50 rounded-lg p-6" data-tutorial="demo">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Test Real-time Features
          </h3>
          <p className="text-gray-600 mb-4">
            Try out the live chat and collaboration features with your study
            groups!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/group/demo-group">
              <Button variant="primary" size="medium">
                Demo Chat Room
              </Button>
            </Link>
            <Link to="/group/cs101-group">
              <Button variant="outline" size="medium">
                CS 101 Group Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onComplete={handleWelcomeComplete}
        user={user}
      />

      <TutorialOverlay
        isActive={dashboardTutorial.isActive}
        steps={tutorialSteps}
        onComplete={dashboardTutorial.completeTutorial}
        onSkip={dashboardTutorial.skipTutorial}
      />

      {/* Schedule Setup Modal */}
      <ScheduleSetup
        isOpen={showScheduleSetup}
        onClose={() => setShowScheduleSetup(false)}
        onComplete={handleScheduleComplete}
      />
    </>
  );
};

export default Dashboard;
