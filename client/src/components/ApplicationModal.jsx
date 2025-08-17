import React from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

const ApplicationModal = ({ 
  showModal, 
  onClose, 
  editingApplication, 
  onSubmit, 
  errors, 
  register, 
  handleSubmit 
}) => {
  if (!showModal) return null;

  return (
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
              onClick={onClose}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
