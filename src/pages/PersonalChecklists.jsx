import React from 'react';
import ChecklistView from '../components/Checklist/ChecklistView';

const PersonalChecklists = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ChecklistView groupId={null} />
    </div>
  );
};

export default PersonalChecklists;