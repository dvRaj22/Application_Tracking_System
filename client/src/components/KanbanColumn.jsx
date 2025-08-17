import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggableApplicationCard from './DraggableApplicationCard';

const KanbanColumn = ({ column, applications, onEdit, onDelete, onViewPDF }) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({ id: `column-${column.id}` });

  const getColumnIcon = (title) => {
    switch (title) {
      case 'Applied':
        return '📝';
      case 'Interview':
        return '🤝';
      case 'Offer':
        return '💼';
      case 'Rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  const getColumnColor = (title) => {
    switch (title) {
      case 'Applied':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'Interview':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'Offer':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'Rejected':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const columnApplications = applications.filter(app => app.status === column.backendStatus);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getColumnIcon(column.title)}</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {column.title}
            </h3>
          </div>
          <span className="px-3 py-1 text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
            {columnApplications.length}
          </span>
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        data-column-id={`column-${column.id}`}
        className={`min-h-[500px] p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${getColumnColor(column.title)} ${
          isOver ? 'bg-opacity-80 border-opacity-100 shadow-lg border-primary-500' : 'hover:shadow-md'
        }`}
      >
        {columnApplications.map((application) => (
          <DraggableApplicationCard
            key={application._id}
            application={application}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewPDF={onViewPDF}
          />
        ))}
        
        {columnApplications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm font-medium">No applications</p>
            <p className="text-xs">Drag applications here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
