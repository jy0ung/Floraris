import React, { useState, useMemo } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import AddEntryModal from './AddEntryModal';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusIcon from './icons/PlusIcon';
import TagIcon from './icons/TagIcon';
import { DiaryEntry, Reminder } from '../types';
import TrashIcon from './icons/TrashIcon';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useReminders } from '../contexts/RemindersContext';
import AddReminderModal from './AddReminderModal';
import BellIcon from './icons/BellIcon';
import PencilIcon from './icons/PencilIcon';
import AddPlantModal from './AddPlantModal';

interface PlantDetailProps {
  plantId: string;
  onBack: () => void;
}

const parseMarkdown = (text: string): string => {
    if (typeof (window as any).marked?.parse === 'function' && typeof (window as any).DOMPurify?.sanitize === 'function') {
        const marked = (window as any).marked;
        marked.setOptions({
            gfm: true,
            breaks: true,
        });
        const dirtyHtml = marked.parse(text);
        return (window as any).DOMPurify.sanitize(dirtyHtml);
    }
    return text.replace(/\n/g, '<br />');
};

const EntryCard: React.FC<{ entry: DiaryEntry }> = ({ entry }) => {
    const sanitizedNotes = useMemo(() => parseMarkdown(entry.notes), [entry.notes]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:border dark:border-gray-700 flex flex-col sm:flex-row gap-4">
            {entry.image && (
            <div className="flex-shrink-0 w-full sm:w-32 h-32">
                <img src={entry.image} alt="Diary entry" className="w-full h-full object-cover rounded-md" />
            </div>
            )}
            <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 my-2 dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />
            {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center mt-2">
                    <TagIcon/>
                    {entry.tags.map((tag: string) => (
                        <span key={tag} className="text-xs font-medium bg-brand-green-100 text-brand-green-800 dark:bg-brand-green-900/50 dark:text-brand-green-300 px-2 py-1 rounded-full">
                        {tag}
                        </span>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

const PlantDetail: React.FC<PlantDetailProps> = ({ plantId, onBack }) => {
  const { getPlant, deletePlant } = useDiary();
  const { reminders, deleteReminder, toggleReminderComplete } = useReminders();
  const plant = getPlant(plantId);

  const [isAddEntryModalOpen, setAddEntryModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddReminderModalOpen, setAddReminderModalOpen] = useState(false);
  const [justHandledId, setJustHandledId] = useState<string | null>(null);


  const plantReminders = useMemo(() => {
    return reminders
      .filter(r => r.plantId === plantId)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [reminders, plantId]);
  
  const handleToggleComplete = (reminder: Reminder) => {
    toggleReminderComplete(reminder.id);
    // For non-recurring reminders that just get completed, the visual feedback is most important.
    // For recurring ones, the date updates, which is also great feedback.
    setJustHandledId(reminder.id);
    setTimeout(() => {
        setJustHandledId(null);
    }, 1000); // Animation duration
  };


  if (!plant) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Plant not found.</p>
        <button onClick={onBack} className="mt-4 text-brand-green-600 dark:text-brand-green-400">Go Back</button>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    deletePlant(plant.id);
    onBack();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-brand-green-700 hover:text-brand-green-800 dark:text-brand-green-400 dark:hover:text-brand-green-300">
        <ArrowLeftIcon />
        Back to Diary
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start">
          <div className="flex-shrink-0">
            <img className="w-full h-48 sm:w-32 sm:h-32 md:w-48 md:h-48 object-cover" src={plant.primaryImage} alt={plant.name} />
          </div>
          <div className="p-4 sm:p-6 flex-1">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{plant.name}</h1>
                    {plant.scientificName && (
                        <p className="mt-1 text-md text-gray-500 dark:text-gray-400 italic">{plant.scientificName}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label={`Edit ${plant.name}`}
                    >
                        <PencilIcon />
                    </button>
                    <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40"
                        aria-label={`Delete ${plant.name}`}
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Added on {new Date(plant.addedDate).toLocaleDateString()}</p>
            {plant.description && (
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{plant.description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Reminders Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Reminders</h2>
            <button
                onClick={() => setAddReminderModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-purple-600 rounded-lg shadow-sm hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple-500"
            >
                <BellIcon />
                Add Reminder
            </button>
        </div>
        <div className="space-y-3">
          {plantReminders.length > 0 ? (
            plantReminders.map(reminder => (
              <div 
                key={reminder.id} 
                className={`p-3 rounded-lg shadow-sm dark:border dark:border-gray-700 flex items-center gap-3 transition-colors duration-500 ${justHandledId === reminder.id ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-gray-800'}`}
              >
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => handleToggleComplete(reminder)}
                  className="h-5 w-5 rounded border-gray-300 text-brand-purple-600 focus:ring-brand-purple-500"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${reminder.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{reminder.task}</p>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 ${reminder.completed ? 'line-through' : ''}`}>
                    {new Date(reminder.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    {reminder.recurrence && reminder.recurrence !== 'none' && <span className="capitalize">, {reminder.recurrence}</span>}
                  </p>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-1.5 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                  aria-label={`Delete reminder: ${reminder.task}`}
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">No reminders set.</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Add a reminder to get notified for watering, fertilizing, etc.</p>
            </div>
          )}
        </div>
      </div>

      {/* Entries Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Entries</h2>
            <button
            onClick={() => setAddEntryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-green-600 rounded-lg shadow-sm hover:bg-brand-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-500"
            >
            <PlusIcon />
            Add Entry
            </button>
        </div>
        <div className="space-y-4">
            {plant.entries.length > 0 ? (
            plant.entries.map(entry => <EntryCard key={entry.id} entry={entry} />)
            ) : (
            <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No entries yet.</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Add your first entry to track this plant's progress!</p>
            </div>
            )}
        </div>
      </div>

      {isAddEntryModalOpen && (
        <AddEntryModal plantId={plant.id} onClose={() => setAddEntryModalOpen(false)} />
      )}
      {isEditModalOpen && (
        <AddPlantModal 
            editingPlant={plant}
            onClose={() => setEditModalOpen(false)}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
            plantName={plant.name}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
        />
      )}
      {isAddReminderModalOpen && (
        <AddReminderModal 
            plantId={plant.id}
            plantName={plant.name}
            onClose={() => setAddReminderModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PlantDetail;
