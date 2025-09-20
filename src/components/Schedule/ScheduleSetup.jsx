import React, { useState } from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import scheduleService from '../../services/scheduleService';
import { useNotification } from '../../contexts/NotificationContext';

const ScheduleSetup = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(''); // 'google' or 'manual'
  const [loading, setLoading] = useState(false);
  const [manualSchedule, setManualSchedule] = useState({
    classes: [],
    weeklySchedule: {}
  });

  const { showSuccess, showError } = useNotification();

  const handleGoogleConnect = async () => {
    setLoading(true);
    try {
      const result = await scheduleService.connectGoogleCalendar();
      showSuccess('Google Calendar connected successfully!');
      onComplete(result.schedule);
    } catch (error) {
      showError('Failed to connect Google Calendar. Please try manual input.');
      console.error('Google Calendar error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSetup = () => {
    setMethod('manual');
    setStep(2);
  };

  const addClassTime = () => {
    setManualSchedule(prev => ({
      ...prev,
      classes: [...prev.classes, {
        id: Date.now(),
        title: '',
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '10:00',
        location: ''
      }]
    }));
  };

  const updateClass = (id, field, value) => {
    setManualSchedule(prev => ({
      ...prev,
      classes: prev.classes.map(cls => 
        cls.id === id ? { ...cls, [field]: value } : cls
      )
    }));
  };

  const removeClass = (id) => {
    setManualSchedule(prev => ({
      ...prev,
      classes: prev.classes.filter(cls => cls.id !== id)
    }));
  };

  const saveManualSchedule = () => {
    try {
      const result = scheduleService.saveManualSchedule(manualSchedule);
      showSuccess('Schedule saved successfully!');
      onComplete(result.schedule);
    } catch (error) {
      showError('Failed to save schedule');
      console.error('Save schedule error:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Set Up Your Schedule
        </h2>
        <p className="text-gray-600 mb-8">
          Help us find the perfect study times by sharing your schedule
        </p>
      </div>

      <div className="space-y-4">
        <Card hover className="p-6 cursor-pointer" onClick={() => setMethod('google')}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">Connect Google Calendar</h3>
              <p className="text-sm text-gray-600">Automatically import your existing schedule</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Card>

        <Card hover className="p-6 cursor-pointer" onClick={handleManualSetup}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">Enter Manually</h3>
              <p className="text-sm text-gray-600">Add your class schedule and busy times</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Card>
      </div>

      {method === 'google' && (
        <div className="text-center pt-4">
          <Button 
            onClick={handleGoogleConnect} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Add Your Classes
        </h2>
        <p className="text-gray-600">
          Enter your class schedule so we can find compatible study times
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {manualSchedule.classes.map((cls) => (
          <Card key={cls.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={cls.title}
                  onChange={(e) => updateClass(cls.id, 'title', e.target.value)}
                  placeholder="e.g., CS 101 - Intro to Programming"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={cls.dayOfWeek}
                  onChange={(e) => updateClass(cls.id, 'dayOfWeek', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={cls.startTime}
                  onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={cls.endTime}
                  onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-end">
                  <div className="flex-1 mr-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location (optional)
                    </label>
                    <input
                      type="text"
                      value={cls.location}
                      onChange={(e) => updateClass(cls.id, 'location', e.target.value)}
                      placeholder="e.g., Engineering Building Room 201"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => removeClass(cls.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={addClassTime} className="w-full sm:w-auto">
          Add Another Class
        </Button>
        <Button onClick={saveManualSchedule} className="w-full sm:w-auto">
          Save Schedule
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};

export default ScheduleSetup;