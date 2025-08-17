import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Users,
  Calendar,
  Briefcase,
  FileText,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApplicationContext } from '../contexts/ApplicationContext';
import toast from 'react-hot-toast';

// Draggable Application Card Component
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
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: '📝' },
      interview: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: '🤝' },
      offer: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: '💼' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: '❌' },
    };
    
    const config = statusConfig[status] || statusConfig.applied;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 cursor-move transition-all duration-200 shadow-sm hover:shadow-md ${
        isDragging ? 'shadow-2xl rotate-2 scale-105 opacity-90 z-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
            {application.candidateName || 'Unnamed Candidate'}
          </h4>
          {getStatusBadge(application.status)}
        </div>
        <div className="relative group ml-3">
          <button 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={() => onEdit(application)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center rounded-t-lg"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(application._id)}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center rounded-b-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Briefcase className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">{application.role || 'Not specified'}</span>
        </div>
        <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Users className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">
            {application.yearsOfExperience || application.experience || 0} years experience
          </span>
        </div>
        <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Calendar className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">
            Applied {formatDate(application.appliedDate || application.createdAt)}
          </span>
        </div>
        {application.notes && (
          <div className="flex items-start p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MessageSquare className="w-4 h-4 mr-3 mt-0.5 text-gray-500" />
            <span className="line-clamp-3">{application.notes}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        {application.resumeLink ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (application.resumeLink) {
                try {
                  window.open(application.resumeLink, '_blank', 'noopener,noreferrer');
                } catch (error) {
                  const link = document.createElement('a');
                  link.href = application.resumeLink;
                  link.download = `resume_${application.candidateName?.replace(/\s+/g, '_') || 'candidate'}.pdf`;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }
            }}
            className="inline-flex items-center text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium hover:underline transition-colors duration-200"
          >
            <FileText className="w-4 h-4 mr-1" />
            View Resume
          </button>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            No resume available
          </span>
        )}
      </div>
    </div>
  );
};

// Column Component
const Column = ({ column, applications, onEdit, onDelete, onViewPDF }) => {
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
            {applications.filter(app => app.status === column.backendStatus).length}
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
        {applications
          .filter(app => app.status === column.backendStatus)
          .map((application) => (
            <DraggableApplicationCard
              key={application._id}
              application={application}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewPDF={onViewPDF}
            />
          ))}
        
        {applications.filter(app => app.status === column.backendStatus).length === 0 && (
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

const KanbanBoard = () => {
  const { applications, setApplications, refreshTrigger } = useApplicationContext();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    experience: '',
    status: ''
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const columns = [
    { id: 'Applied', title: 'Applied', backendStatus: 'applied' },
    { id: 'Interview', title: 'Interview', backendStatus: 'interview' },
    { id: 'Offer', title: 'Offer', backendStatus: 'offer' },
    { id: 'Rejected', title: 'Rejected', backendStatus: 'rejected' },
  ];

  useEffect(() => {
    fetchApplications();
  }, [filters, refreshTrigger]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/applications?${params}`);
      setApplications(response.data.data.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    console.log('Drag start:', event.active.id);
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    console.log('Drag end event:', { active, over });
    
    if (!over) {
      console.log('No over target, ending drag');
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    
    console.log('Processing drop:', { activeId, overId });
    
    if (activeId === overId) {
      console.log('Same item, no action needed');
      setActiveId(null);
      return;
    }

    const activeApplication = applications.find(app => app._id === activeId);
    if (!activeApplication) {
      console.log('Active application not found:', activeId);
      setActiveId(null);
      return;
    }
    
    console.log('Active application:', activeApplication);
    
    let targetColumn;
    if (overId.startsWith('column-')) {
      const columnId = overId.replace('column-', '');
      targetColumn = columns.find(col => col.id === columnId);
      console.log('Dropping on column:', columnId, 'Target column:', targetColumn);
    } else {
      const overApplication = applications.find(app => app._id === overId);
      if (overApplication) {
        targetColumn = columns.find(col => col.backendStatus === overApplication.status);
        console.log('Dropping on application in column:', overApplication.status, 'Target column:', targetColumn);
      }
    }
    
    if (!targetColumn) {
      console.log('No target column found for overId:', overId);
      setActiveId(null);
      return;
    }
    
    console.log('Target column found:', targetColumn);
    
    if (activeApplication.status !== targetColumn.backendStatus) {
      console.log('Updating status from', activeApplication.status, 'to', targetColumn.backendStatus);
      updateApplicationStatus(activeId, targetColumn.backendStatus);
    } else {
      console.log('Same column, no status update needed');
    }
    
    setActiveId(null);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      console.log('Making API call to update status:', applicationId, 'to', newStatus);
      
      const response = await api.patch(`/applications/${applicationId}/status`, { 
        status: newStatus 
      });
      
      console.log('API response:', response.data);
      
      // Update local state immediately for real-time feedback
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
      toast.success('Application status updated');
    } catch (error) {
      console.error('Failed to update status:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to update application status');
      // Revert the change if API call failed
      fetchApplications();
    }
  };

  const onSubmit = async (data) => {
    try {
      // Clean up empty fields
      if (data.resumeLink === '') {
        data.resumeLink = undefined;
      }
      if (data.notes === '') {
        data.notes = undefined;
      }
      
      if (editingApplication) {
        await api.put(`/applications/${editingApplication._id}`, data);
        toast.success('Application updated successfully');
      } else {
        // For new applications, set status to 'applied' if not specified
        if (!data.status) {
          data.status = 'applied';
        }
        await api.post('/applications', data);
        toast.success('Application added successfully');
      }
      
      setShowAddModal(false);
      setEditingApplication(null);
      reset();
      fetchApplications();
    } catch (error) {
      console.error('Failed to save application:', error);
      toast.error('Failed to save application');
    }
  };

  const handleEdit = (application) => {
    setEditingApplication(application);
    reset(application);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        toast.success('Application deleted successfully');
        fetchApplications();
      } catch (error) {
        console.error('Failed to delete application:', error);
        toast.error('Failed to delete application');
      }
    }
  };

  const handleViewPDF = (file) => {
    if (file) {
      window.open(file, '_blank');
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  const activeApplication = applications.find(app => app._id === activeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Kanban Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your candidate pipeline with intuitive drag and drop
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Application
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-gray-500" />
          Filter Applications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Candidates
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or role..."
                className="input pl-10 w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Role
            </label>
            <input
              type="text"
              placeholder="Filter by role..."
              className="input w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Level
            </label>
            <select
              className="select w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
            >
              <option value="">All experience levels</option>
              <option value="0">0-2 years</option>
              <option value="2">2-5 years</option>
              <option value="5">5-8 years</option>
              <option value="8">8+ years</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Status
            </label>
            <select
              className="select w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="text-2xl mr-3">📊</span>
          Application Pipeline
        </h3>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                applications={applications}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewPDF={handleViewPDF}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId && activeApplication ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-2xl rotate-2 scale-105 opacity-90 max-w-sm">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {activeApplication.candidateName}
                  </h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">{activeApplication.role}</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">{activeApplication.yearsOfExperience} years experience</span>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary-500" />
                {editingApplication ? 'Edit Application' : 'Add New Application'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Candidate Name
                </label>
                <input
                  type="text"
                  className={`input w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.candidateName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter candidate name"
                  {...register('candidateName', { required: 'Name is required' })}
                />
                {errors.candidateName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.candidateName.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Role
                </label>
                <input
                  type="text"
                  className={`input w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.role ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter job role"
                  {...register('role', { required: 'Role is required' })}
                />
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.role.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className={`input w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.yearsOfExperience ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter years of experience"
                  {...register('yearsOfExperience', { 
                    required: 'Experience is required',
                    min: { value: 0, message: 'Experience cannot be negative' }
                  })}
                />
                {errors.yearsOfExperience && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.yearsOfExperience.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Resume Link (Optional)
                </label>
                <input
                  type="url"
                  className="input w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="https://example.com/resume.pdf"
                  {...register('resumeLink')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  className="select w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...register('status', { required: 'Status is required' })}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  className="input w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                  placeholder="Add any notes about the candidate..."
                  {...register('notes')}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingApplication ? 'Update Application' : 'Add Application'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingApplication(null);
                    reset();
                  }}
                  className="btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;



