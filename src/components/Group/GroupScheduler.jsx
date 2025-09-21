import React, { useState } from 'react';
import groupMatchingService from '../../services/groupMatchingService';
import Button from '../UI/Button';
import { useNotification } from '../../contexts/NotificationContext';

const GroupScheduler = ({ groupId, members }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const findOptimalTimes = async () => {
    setLoading(true);
    try {
      const memberIds = members.map(member => member.id);
      const slots = await groupMatchingService.findStudyMatches(memberIds);
      setAvailableSlots(slots);
      showSuccess('Found optimal study times!');
    } catch (error) {
      showError('Failed to find study times');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={findOptimalTimes} disabled={loading}>
        {loading ? 'Finding Times...' : 'Find Optimal Study Times'}
      </Button>
      
      {availableSlots.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Suggested Times:</h3>
          {availableSlots.map((slot, index) => (
            <div key={index} className="p-3 border rounded mt-2">
              <p>{new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleString()}</p>
              <p>{slot.attendee_count} members available</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupScheduler;