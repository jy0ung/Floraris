import React, { useState, useMemo } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import AddPlantModal from './AddPlantModal';
import PlantDetail from './PlantDetail';
import PlusIcon from './icons/PlusIcon';
import { Plant } from '../types';
import IdentifyModal from './IdentifyModal';

interface PlantDiaryProps {
  selectedPlantId: string | null;
  onSelectPlant: (id: string) => void;
  onBack: () => void;
}

const PlantCard: React.FC<{ plant: Plant, onClick: () => void }> = ({ plant, onClick }) => (
  <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl dark:hover:border-brand-purple-600 transition-all duration-300 group">
    <div className="h-48 overflow-hidden">
      <img src={plant.primaryImage} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">{plant.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(plant.addedDate).toLocaleDateString()}</p>
    </div>
  </div>
);

const PlantDiary: React.FC<PlantDiaryProps> = ({ selectedPlantId, onSelectPlant, onBack }) => {
  const { plants } = useDiary();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isIdentifyModalOpen, setIsIdentifyModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('addedDate_desc');

  const sortedPlants = useMemo(() => {
    const [key, direction] = sortOrder.split('_');
    return [...plants].sort((a, b) => {
      let valA, valB;
      if (key === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else { // addedDate
        valA = new Date(a.addedDate).getTime();
        valB = new Date(b.addedDate).getTime();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [plants, sortOrder]);

  if (selectedPlantId) {
    return <PlantDetail plantId={selectedPlantId} onBack={onBack} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">My Plant Diary</h1>
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="sort-order" className="text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">Sort by:</label>
                <select 
                    id="sort-order"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-brand-purple-300 focus:ring focus:ring-brand-purple-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="addedDate_desc">Newest First</option>
                    <option value="addedDate_asc">Oldest First</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                </select>
            </div>
            <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-green-600 rounded-lg shadow-sm hover:bg-brand-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-500"
            >
            <PlusIcon />
            Add Plant
            </button>
        </div>
      </div>

      {plants.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Your diary is empty.</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">Add your first plant manually or use the AI identifier.</p>
           <button 
                onClick={() => setIsIdentifyModalOpen(true)}
                className="px-6 py-3 text-base font-semibold text-white bg-brand-purple-600 rounded-lg shadow-md hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple-500"
            >
                Identify Your First Plant
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedPlants.map(plant => (
            <PlantCard key={plant.id} plant={plant} onClick={() => onSelectPlant(plant.id)} />
          ))}
        </div>
      )}
      
      {isAddModalOpen && <AddPlantModal onClose={() => setAddModalOpen(false)} />}
      {isIdentifyModalOpen && <IdentifyModal onClose={() => setIsIdentifyModalOpen(false)} />}
    </div>
  );
};

export default PlantDiary;