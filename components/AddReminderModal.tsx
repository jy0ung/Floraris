import React, { useState } from 'react';
import { useReminders } from '../contexts/RemindersContext';
import { Reminder } from '../types';

interface AddReminderModalProps {
  plantId: string;
  plantName: string;
  onClose: () => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({ plantId, plantName, onClose }) => {
  const { addReminder } = useReminders();
  
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  now.setSeconds(0);
  now.setMilliseconds(0);
  const defaultDateTime = now.toISOString().slice(0, 16);

  const [dateTime, setDateTime] = useState(defaultDateTime);
  const [task, setTask] = useState('');
  const [recurrence, setRecurrence] = useState<Reminder['recurrence']>('none');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!task.trim()) {
      setError('Task description is required.');
      return;
    }
    if (!dateTime) {
      setError('A valid date and time are required.');
      return;
    }

    const finalDateTime = new Date(dateTime).toISOString();
    
    addReminder({ plantId, plantName, task, dateTime: finalDateTime, recurrence });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add Reminder</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">For: {plantName}</p>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="reminder-task" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task</label>
            <input 
              id="reminder-task" 
              type="text"
              value={task} 
              onChange={e => {
                setTask(e.target.value);
                if (error) setError('');
              }} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              placeholder="e.g., Water thoroughly" 
            />
          </div>
          <div>
              <label htmlFor="reminder-datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
              <input 
                type="datetime-local" 
                id="reminder-datetime" 
                value={dateTime} 
                onChange={e => setDateTime(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              />
          </div>
          <div>
            <label htmlFor="reminder-recurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat</label>
            <select
              id="reminder-recurrence"
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as Reminder['recurrence'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-purple-600 border border-transparent rounded-md hover:bg-brand-purple-700">Set Reminder</button>
        </div>
      </div>
    </div>
  );
};

export default AddReminderModal;