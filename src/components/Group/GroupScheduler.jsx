import React, { useState } from 'react';
import groupMatchingService from '../../services/groupMatchingService';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { useNotification } from '../../contexts/NotificationContext';
import { findOptimalTime } from '../../services/aiStudyService';

const GroupScheduler = ({ groupId, members = [] }) => {
  const [suggestedTimes, setSuggestedTimes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    duration: 60,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00'
  });

  const { showSuccess, showError } = useNotification();

  // Method 1: Using the actual API endpoint
  const handleFindTimesClick = async () => {
    setLoading(true);
    try {
      if (!groupId) {
        showError('Group ID is required to find optimal times');
        return;
      }

      console.log('Finding optimal times for group:', groupId);
      const optimalTimes = await findOptimalTime({ groupId });
      setSuggestedTimes(optimalTimes);
      showSuccess(`Found ${optimalTimes.length} optimal meeting times!`);
      console.log("Found optimal times:", optimalTimes);
    } catch (error) {
      console.error("Failed to get optimal times from API:", error);
      showError('Failed to find optimal times. Make sure the group has members with schedules.');
    } finally {
      setLoading(false);
    }
  };

  // Method 2: Using the group matching service approach (fallback)
  const findOptimalTimesGroupService = async () => {
    setLoading(true);
    try {
      const memberData = members.map(member => ({
        userId: member.id || member.userId,
        schedule: member.schedule || []
      }));

      const slots = await groupMatchingService.findStudyMatches(
        memberData, 
        searchParams.duration
      );
      
      setAvailableSlots(slots);
      showSuccess('Found optimal study times using group service!');
    } catch (error) {
      console.error("Failed to get times from group service:", error);
      showError('Failed to find study times using group service');
    } finally {
      setLoading(false);
    }
  };

  // Try both services - AI first, then group service as fallback
  const findAllOptimalTimes = async () => {
    await handleFindTimesClick();
    
    // If AI service didn't return results and we have members, try group service
    if (suggestedTimes.length === 0 && members.length > 0) {
      await findOptimalTimesGroupService();
    }
  };

  const updateSearchParam = (key, value) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const formatTimeSlot = (slot) => {
    if (slot.start && slot.end) {
      // Handle different time formats
      const startTime = new Date(slot.start);
      const endTime = new Date(slot.end);
      return {
        start: startTime.toLocaleString(),
        end: endTime.toLocaleString(),
        duration: Math.round((endTime - startTime) / (1000 * 60)) + ' minutes'
      };
    }
    return slot;
  };

  return (
    <div className="space-y-4">
      {/* Search Parameters */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Meeting Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <select
              value={searchParams.duration}
              onChange={(e) => updateSearchParam('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => updateSearchParam('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) => updateSearchParam('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <div className="flex space-x-1">
              <input
                type="time"
                value={searchParams.startTime}
                onChange={(e) => updateSearchParam('startTime', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="time"
                value={searchParams.endTime}
                onChange={(e) => updateSearchParam('endTime', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={findAllOptimalTimes} disabled={loading}>
          {loading ? 'Finding Times...' : 'Find Best Meeting Times'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleFindTimesClick} 
          disabled={loading}
        >
          AI Service Only
        </Button>
        
        {members.length > 0 && (
          <Button 
            variant="outline" 
            onClick={findOptimalTimesGroupService} 
            disabled={loading}
          >
            Group Service Only
          </Button>
        )}
      </div>

      {/* Results from AI Service */}
      {suggestedTimes.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            AI-Suggested Times ({suggestedTimes.length})
          </h3>
          <div className="space-y-2">
            {suggestedTimes.map((time, index) => {
              const formatted = formatTimeSlot(time);
              return (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-blue-900">
                        {formatted.start} - {formatted.end}
                      </p>
                      {time.score && (
                        <p className="text-sm text-blue-700">
                          Compatibility Score: {Math.round(time.score * 100)}%
                        </p>
                      )}
                      {time.participants && (
                        <p className="text-sm text-blue-600">
                          {time.participants.length} participants available
                        </p>
                      )}
                    </div>
                    <Button size="small" variant="outline">
                      Schedule
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Results from Group Service */}
      {availableSlots.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Group Service Results ({availableSlots.length})
          </h3>
          <div className="space-y-2">
            {availableSlots.map((slot, index) => {
              const formatted = formatTimeSlot(slot);
              return (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-900">
                        {formatted.start} - {formatted.end}
                      </p>
                      {slot.attendee_count && (
                        <p className="text-sm text-green-700">
                          {slot.attendee_count} members available
                        </p>
                      )}
                      {formatted.duration && (
                        <p className="text-sm text-green-600">
                          Duration: {formatted.duration}
                        </p>
                      )}
                    </div>
                    <Button size="small" variant="outline">
                      Schedule
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* No Results */}
      {!loading && suggestedTimes.length === 0 && availableSlots.length === 0 && (
        <Card className="p-6 text-center">
          <div className="text-gray-500">
            <p className="mb-2">No optimal times found.</p>
            <p className="text-sm">Try adjusting your search parameters or adding more group members.</p>
          </div>
        </Card>
      )}

      {/* Debug Info */}
      {members.length > 0 && (
        <div className="text-xs text-gray-400">
          Group: {groupId || 'No ID'} | Members: {members.length}
        </div>
      )}
    </div>
  );
};

export default GroupScheduler;