import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Plus, 
  Eye, 
  Clock,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApplicationContext } from '../contexts/ApplicationContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { refreshTrigger } = useApplicationContext();
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, applicationsResponse] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/applications?limit=5&sortBy=appliedDate&sortOrder=desc')
      ]);

      setStats(statsResponse.data.data);
      setRecentApplications(applicationsResponse.data.data.applications);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Interview':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Overview of your applicant tracking system
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/kanban"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Candidates */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Candidates
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.summary?.totalCandidates || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Active Applications */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Applications
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.summary?.activeApplications || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Successful Placements */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Successful Placements
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.summary?.successfulPlacements || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Rate */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rejection Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.summary?.rejectionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/kanban"
          className="card p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                Manage Applications
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                View and organize your candidate pipeline
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
          </div>
        </Link>

        <Link
          to="/analytics"
          className="card p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                View Analytics
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Analyze your recruitment performance
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
          </div>
        </Link>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Stats
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Average Experience: {stats?.experienceStats?.averageExperience?.toFixed(1) || 0} years
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Applications
          </h3>
        </div>
        <div className="p-6">
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div
                  key={application._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {application.candidateName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {application.role} • {application.yearsOfExperience} years exp.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(application.appliedDate)}
                    </span>
                    <Link
                      to={`/kanban?application=${application._id}`}
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your candidate pipeline by adding your first application.
              </p>
              <Link
                to="/kanban"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Application
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
