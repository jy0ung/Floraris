import React, { useMemo, useState, useRef, useEffect } from 'react';
import { CodexEntry, Plant } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import { useCodex } from '../contexts/CodexContext';
import DeleteCodexConfirmationModal from './DeleteCodexConfirmationModal';
import { parseCareGuide, parseMarkdown } from '../utils/markdownUtils';
import WaterDropIcon from './icons/WaterDropIcon';
import SunIcon from './icons/SunIcon';
import SoilIcon from './icons/SoilIcon';
import FertilizerIcon from './icons/FertilizerIcon';
import PestWarningIcon from './icons/PestWarningIcon';
import { useDiary } from '../contexts/DiaryContext';
import ShareIcon from './icons/ShareIcon';
import ShareFallbackModal from './ShareFallbackModal';
import PencilIcon from './icons/PencilIcon';
import EditCodexModal from './EditCodexModal';
import WarningIcon from './icons/WarningIcon';


interface CodexDetailProps {
    entry: CodexEntry;
    onBack: () => void;
    onNavigateToPlant: (plantId: string) => void;
    onSelectEntry: (entryId: string) => void;
}

interface CareSectionProps {
    title: string;
    icon: React.ReactNode;
    content: string;
    plants: Plant[];
    codexEntries: CodexEntry[];
}
  
const CareSection: React.FC<CareSectionProps> = ({ title, icon, content, plants, codexEntries }) => {
    // Use breaks: false for proper rendering of long-form markdown content like lists and blockquotes.
    const sanitizedHtml = useMemo(() => parseMarkdown(content, { breaks: false, plants, codexEntries }), [content, plants, codexEntries]);
    if (!content.trim()) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <div className="text-brand-green-600 dark:text-brand-green-400">{icon}</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        </div>
    );
};

const CodexDetail: React.FC<CodexDetailProps> = ({ entry, onBack, onNavigateToPlant, onSelectEntry }) => {
    const { deleteCodexEntry, codexEntries } = useCodex();
    const { plants } = useDiary();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    
    const careGuide = useMemo(() => parseCareGuide(entry.markdownContent), [entry.markdownContent]);
    const introductionHtml = useMemo(() => parseMarkdown(careGuide.introduction, { breaks: false, plants, codexEntries }), [careGuide.introduction, plants, codexEntries]);

    useEffect(() => {
        const element = contentRef.current;
        if (!element) return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const link = target.closest('a.internal-link');
            if (link instanceof HTMLAnchorElement) {
                event.preventDefault();
                const plantId = link.dataset.plantId;
                const codexId = link.dataset.codexId;

                if (codexId) {
                    onSelectEntry(codexId);
                } else if (plantId) {
                    onNavigateToPlant(plantId);
                }
            }
        };

        element.addEventListener('click', handleClick);
        return () => {
            element.removeEventListener('click', handleClick);
        };
    }, [onNavigateToPlant, onSelectEntry]);


    const handleConfirmDelete = () => {
        deleteCodexEntry(entry.id);
        onBack();
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?codexId=${entry.id}`;
        const shareData = {
          title: `Floraris Codex: ${entry.name}`,
          text: `Check out the care guide for ${entry.name} on Floraris!`,
          url: shareUrl,
        };
    
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.error('Error sharing:', err);
          }
        } else {
          // Fallback for browsers that don't support Web Share API
          setShareModalOpen(true);
        }
    };

    return (
        <>
            <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6" ref={contentRef}>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-brand-green-700 hover:text-brand-green-800 dark:text-brand-green-400 dark:hover:text-brand-green-300">
                    <ArrowLeftIcon />
                    Back to Codex
                </button>

                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden md:flex">
                    <div className="md:flex-shrink-0">
                        <img className="h-56 w-full object-cover md:w-56" src={entry.image} alt={entry.name} />
                    </div>
                    <div className="p-6 flex-1">
                         <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{entry.name}</h1>
                                <p className="mt-1 text-md text-gray-500 dark:text-gray-400 italic">{entry.scientificName}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                                <button
                                    onClick={() => setEditModalOpen(true)}
                                    className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                    aria-label={`Edit ${entry.name} Codex Entry`}
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                    aria-label={`Share ${entry.name} from Codex`}
                                >
                                    <ShareIcon />
                                </button>
                                <button
                                    onClick={() => setDeleteModalOpen(true)}
                                    className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40"
                                    aria-label={`Delete ${entry.name} from Codex`}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                         <div 
                            className="mt-4 prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert" 
                            dangerouslySetInnerHTML={{ __html: introductionHtml }}
                        />
                    </div>
                </div>

                {/* Content Warning Section */}
                {entry.contentWarning && (
                    <div className="bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-md" role="alert">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <WarningIcon />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold">Caution</p>
                                <div className="mt-2 text-sm">
                                    <p>{entry.contentWarning}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Care Guide Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CareSection title="Watering" icon={<WaterDropIcon />} content={careGuide.watering} plants={plants} codexEntries={codexEntries} />
                    <CareSection title="Sunlight" icon={<SunIcon />} content={careGuide.sunlight} plants={plants} codexEntries={codexEntries} />
                    <CareSection title="Soil" icon={<SoilIcon />} content={careGuide.soil} plants={plants} codexEntries={codexEntries} />
                    <CareSection title="Fertilizer" icon={<FertilizerIcon />} content={careGuide.fertilizer} plants={plants} codexEntries={codexEntries} />
                    <CareSection title="Pests & Diseases" icon={<PestWarningIcon />} content={careGuide.pests} plants={plants} codexEntries={codexEntries} />
                </div>
            </div>
            {isDeleteModalOpen && (
                <DeleteCodexConfirmationModal
                    entryName={entry.name}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                />
            )}
            {isShareModalOpen && (
                <ShareFallbackModal
                    url={`${window.location.origin}${window.location.pathname}?codexId=${entry.id}`}
                    onClose={() => setShareModalOpen(false)}
                />
            )}
            {isEditModalOpen && (
                <EditCodexModal
                    entry={entry}
                    onClose={() => setEditModalOpen(false)}
                />
            )}
        </>
    );
};

export default CodexDetail;