import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingState from '../components/UI/LoadingState';
import EmptyState from '../components/UI/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'upcoming'

  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Mock user's groups with more detailed information
  const mockUserGroups = [
    {
      id: 'cs101-group',
      name: 'CS 101 - Data Structures',
      subject: 'Computer Science',
      description: 'Weekly study sessions covering algorithms and data structures',
      members: 4,
      maxMembers: 5,
      role: 'member',
      joinedDate: '2024-01-15',
      nextSession: {
        date: 'Today',
        time: '3:00 PM',
        location: 'Library Room 201',
        agenda: 'Review binary trees and graph traversal algorithms'
      },
      recentActivity: [
        { type: 'message', content: 'Alice shared study notes', time: '2 hours ago' },
        { type: 'session', content: 'Study session completed', time: '2 days ago' },
        { type: 'join', content: 'Bob joined the group', time: '1 week ago' }
      ],
      stats: {
        sessionsAttended: 8,
        totalSessions: 10,
        contributionScore: 85
      },
      status: 'active'
    },
    {
      id: 'math205-group',
      name: 'MATH 205 - Calculus II',
      subject: 'Mathematics',
      description: 'Problem-solving focused group for calculus concepts',
      members: 3,
      maxMembers: 4,
      role: 'organizer',
      joinedDate: '2024-01-10',
      nextSession: {
        date: 'Tomorrow',
        time: '2:00 PM',
        location: 'Math Building 305',
        agenda: 'Integration by parts and applications'
      },
      recentActivity: [
        { type: 'message', content: 'You scheduled a new session', time: '1 hour ago' },
        { type: 'material', content: 'Practice problems uploaded', time: '1 day ago' },
        { type: 'session', content: 'Study session completed', time: '3 days ago' }
      ],
      stats: {
        sessionsAttended: 12,
        totalSessions: 12,
        contributionScore: 95
      },
      status: 'active'
    },
    {
      id: 'phys101-group',
      name: 'PHYS 101 - Mechanics',
      subject: 'Physics',
      description: 'Lab preparation and problem solving',
      members: 5,
      maxMembers: 6,
      role: 'member',
      joinedDate: '2024-02-01',
      nextSession: {
        date: 'Wednesday',
        time: '4:00 PM',
        location: 'Science Building',
        agenda: 'Prepare for Lab 5: Momentum and Collisions'
      },
      recentActivity: [
        { type: 'material', content: 'Lab guidelines shared', time: '4 hours ago' },
        { type: 'message', content: 'Emma posted lab questions', time: '1 day ago' },
        { type: 'session', content: 'Study session completed', time: '1 week ago' }
      ],
      stats: {
        sessionsAttended: 3,
        totalSessions: 4,
        contributionScore: 78
      },
      status: 'active'
    }
  ];

  useEffect(() => {
    loadUserGroups();
  }, []);

  const loadUserGroups = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setGroups(mockUserGroups);
    } catch (error) {
      showError('Failed to load your groups');
      console.error('Load groups error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group.role === 'organizer') {
      showError('You cannot leave a group you organize. Transfer ownership first.');
      return;
    }

    setGroups(prev => prev.filter(g => g.id !== groupId));
    showSuccess('You have left the study group');
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return role === 'organizer' ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Organizer
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Member
      </span>
    );
  };

  const filteredGroups = groups.filter(group => {
    if (filter === 'all') return true;
    return group.status === filter;
  });

  if (loading) {
    return <LoadingState message="Loading your study groups..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Study Groups</h1>
        <p className="text-gray-600 mb-6">
          Manage your study groups and track your progress
        </p>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'all', label: 'All Groups' },
              { id: 'active', label: 'Active' },
              { id: 'upcoming', label: 'Upcoming' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  filter === tab.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link to="/find-groups">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Join New Group
            </Button>
          </Link>
        </div>
      </div>

      {/* Groups List */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          title="No study groups found"
          description="Join your first study group to start collaborating with classmates"
          actionLabel="Find Groups"
          onAction={() => window.location.href = '/find-groups'}
        />
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Main Group Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {group.name}
                    </h3>
                    {getRoleBadge(group.role)}
                    {getStatusBadge(group.status)}
                  </div>

                  <p className="text-gray-600 mb-4">{group.description}</p>

                  {/* Group Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {group.members}/{group.maxMembers}
                      </div>
                      <div className="text-xs text-gray-600">Members</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {group.stats.sessionsAttended}
                      </div>
                      <div className="text-xs text-gray-600">Sessions Attended</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.round((group.stats.sessionsAttended / group.stats.totalSessions) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">Attendance</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {group.stats.contributionScore}
                      </div>
                      <div className="text-xs text-gray-600">Contribution Score</div>
                    </div>
                  </div>

                  {/* Next Session */}
                  {group.nextSession && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">Next Session</h4>
                      <div className="text-sm text-blue-800">
                        <div>{group.nextSession.date} at {group.nextSession.time}</div>
                        <div>{group.nextSession.location}</div>
                        <div className="mt-1 font-medium">{group.nextSession.agenda}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar - Recent Activity */}
                <div className="lg:w-80">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    {group.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.content}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-3">
                    <Link to={`/group/${group.id}`} className="block">
                      <Button className="w-full">
                        Open Group Chat
                      </Button>
                    </Link>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="small" className="flex-1">
                        View Calendar
                      </Button>
                      <Button variant="outline" size="small" className="flex-1">
                        Settings
                      </Button>
                    </div>

                    {group.role !== 'organizer' && (
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => handleLeaveGroup(group.id)}
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Leave Group
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroups;