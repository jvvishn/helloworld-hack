import React, { useState } from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import scheduleService from '../../services/scheduleService';
import { useNotification } from '../../contexts/NotificationContext';

const ScheduleSetup = ({ isOpen, onClose, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [manualSchedule, setManualSchedule] = useState({
    classes: [],
    busyTimes: []
  });

  const { showSuccess, showError } = useNotification();

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

  const saveManualSchedule = async () => {
    // Validate that we have at least one class
    if (manualSchedule.classes.length === 0) {
      showError('Please add at least one class to your schedule');
      return;
    }

    // Validate that all classes have required fields
    const invalidClass = manualSchedule.classes.find(cls => 
      !cls.title.trim() || !cls.startTime || !cls.endTime
    );

    if (invalidClass) {
      showError('Please fill in all required fields for each class');
      return;
    }

    setLoading(true);
    try {
      // Transform classes to include busyTimes for the algorithm
      const scheduleWithBusyTimes = {
        ...manualSchedule,
        busyTimes: manualSchedule.classes.map(cls => ({
          title: cls.title,
          dayOfWeek: cls.dayOfWeek,
          start: new Date(`2024-01-01 ${cls.startTime}`),
          end: new Date(`2024-01-01 ${cls.endTime}`)
        }))
      };

      console.log('Saving schedule:', scheduleWithBusyTimes);
      
      const result = await scheduleService.saveManualSchedule(scheduleWithBusyTimes);
      console.log('Save result:', result);
      
      showSuccess('Schedule saved successfully!');
      onComplete(result.schedule);
    } catch (error) {
      console.error('Save schedule error details:', error);
      
      // More specific error handling
      if (error.message.includes('fetch')) {
        showError('Unable to connect to server. Schedule saved locally only.');
        // Save locally as fallback
        localStorage.setItem('userSchedule', JSON.stringify(manualSchedule));
        localStorage.setItem('scheduleSource', 'manual');
        onComplete(manualSchedule);
      } else {
        showError(`Failed to save schedule: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ics')) {
      showError('Please select an .ics calendar file');
      return;
    }

    setLoading(true);
    try {
      console.log('Importing file:', file.name, 'Size:', file.size, 'bytes');
      const importedSchedule = await scheduleService.importFromFile(file);
      
      if (importedSchedule.classes.length === 0) {
        showError('No classes found in the calendar file. Try adding classes manually.');
      } else {
        setManualSchedule(importedSchedule);
        showSuccess(`Schedule imported successfully! Found ${importedSchedule.classes.length} classes.`);
      }
    } catch (error) {
      console.error('Import error:', error);
      showError(error.message || 'Failed to import schedule. Please check your file format.');
    } finally {
      setLoading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Set Up Your Schedule
          </h2>
          <p className="text-gray-600 mb-6">
            Add your class schedule so we can find compatible study times with other students
          </p>
        </div>

        {/* File Import Option */}
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          loading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mb-4">
            <label className="cursor-pointer">
              <span className={`font-medium ${loading ? 'text-blue-600' : 'text-blue-600 hover:text-blue-500'}`}>
                {loading ? 'Processing file...' : 'Import from calendar file'}
              </span>
              <input
                type="file"
                accept=".ics"
                onChange={handleFileImport}
                className="hidden"
                disabled={loading}
              />
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Upload an .ics file from Google Calendar, Outlook, or Apple Calendar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported formats: .ics files only
            </p>
          </div>
        </div>

        {/* Manual Schedule Entry */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Classes ({manualSchedule.classes.length})
            </h3>
            <Button variant="outline" onClick={addClassTime} size="small">
              Add Class
            </Button>
          </div>

          {manualSchedule.classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No classes added yet. Click "Add Class" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {manualSchedule.classes.map((cls) => (
                <Card key={cls.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Name *
                      </label>
                      <input
                        type="text"
                        value={cls.title}
                        onChange={(e) => updateClass(cls.id, 'title', e.target.value)}
                        placeholder="e.g., CS 101 - Intro to Programming"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Week *
                      </label>
                      <select
                        value={cls.dayOfWeek}
                        onChange={(e) => updateClass(cls.id, 'dayOfWeek', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
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
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={cls.startTime}
                        onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={cls.endTime}
                        onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
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
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={saveManualSchedule} 
            className="w-full sm:w-auto"
            disabled={loading || manualSchedule.classes.length === 0}
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500 text-center">
          <p>* Required fields</p>
          <p className="mt-1">
            Your schedule helps us find compatible study times with other students in your classes.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleSetup;