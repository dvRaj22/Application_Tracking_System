import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Trash2, FileText, Briefcase, Users, Calendar, ExternalLink, MessageSquare } from 'lucide-react';

const DraggableApplicationCard = ({ application, onEdit, onDelete, onViewPDF }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleResumeClick = (e) => {
    e.stopPropagation();
    if (application.resumeLink) {
      
      try {
        window.open(application.resumeLink, '_blank', 'noopener,noreferrer');
      } catch (error) {
        // Fallback: create a download link
        const link = document.createElement('a');
        link.href = application.resumeLink;
        link.download = `resume_${application.candidateName.replace(/\s+/g, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 select-none ${
        isDragging ? 'shadow-2xl rotate-2 scale-105 opacity-90 z-50' : ''
      }`}
    >
      {/* Header with Name and Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
            {application.candidateName || 'Unnamed Candidate'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ID: {application._id?.slice(-8) || 'N/A'}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${getStatusColor(application.status)}`}>
          {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Unknown'}
        </span>
      </div>
      
      {/* Main Details */}
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
        {/* Job Role */}
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Briefcase className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Role:</span>
            <span className="ml-2">{application.role || 'Not specified'}</span>
          </div>
        </div>

        {/* Experience */}
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Users className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Experience:</span>
            <span className="ml-2">
              {application.yearsOfExperience || application.experience || 0} years
            </span>
          </div>
        </div>

        {/* Applied Date */}
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Calendar className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Applied:</span>
            <span className="ml-2">
              {formatDate(application.appliedDate || application.createdAt)}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        {application.lastUpdated && (
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Calendar className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium">Last Updated:</span>
              <span className="ml-2">{formatDate(application.lastUpdated)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {application.notes && (
          <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MessageSquare className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-gray-700 dark:text-gray-300 line-clamp-3">
                {application.notes}
              </p>
            </div>
          </div>
        )}

        {/* Resume Link */}
        {application.resumeLink && (
          <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <FileText className="w-4 h-4 mr-3 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-green-700 dark:text-green-300">Resume Available</span>
              <div className="mt-1">
                <button
                  onClick={handleResumeClick}
                  className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium hover:underline transition-colors duration-200"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(application);
            }}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
            title="Edit Application"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(application._id);
            }}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            title="Delete Application"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Additional Information */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {application.recruiter && (
            <span className="block">Recruiter: {application.recruiter}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableApplicationCard;
