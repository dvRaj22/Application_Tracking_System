import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApplicationContext } from '../contexts/ApplicationContext';
import AnalyticsExport from '../components/AnalyticsExport';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { refreshTrigger } = useApplicationContext();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const exportRef = useRef(null);


  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, refreshTrigger]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const [dashboardResponse, timelineResponse] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get(`/analytics/timeline?period=${timeRange}`)
      ]);

      setAnalyticsData({
        ...dashboardResponse.data.data,
        timeline: timelineResponse.data.data.timelineData
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

  const formatTimelineData = (data) => {
    if (!data) return [];
    
    return data.map(item => ({
      name: timeRange === 'monthly' 
        ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
        : timeRange === 'weekly'
        ? `Week ${item._id.week}`
        : item._id.date,
      applications: item.totalApplications,
      applied: item.statusCounts?.Applied || 0,
      interview: item.statusCounts?.Interview || 0,
      offer: item.statusCounts?.Offer || 0,
      rejected: item.statusCounts?.Rejected || 0,
    }));
  };

  const formatLastUpdated = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-6" ref={exportRef}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Comprehensive insights into your recruitment performance
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Last updated: {formatLastUpdated(lastUpdated)} • Auto-refreshes every 30 seconds
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="select border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="btn-secondary inline-flex items-center px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <AnalyticsExport analyticsData={analyticsData} timeRange={timeRange} exportRef={exportRef} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Candidates
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.summary?.totalCandidates || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Experience
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.experienceStats?.averageExperience?.toFixed(1) || 0} yrs
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Applications
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.summary?.activeApplications || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rejection Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.summary?.rejectionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Application Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.statusCounts || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData?.statusCounts?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Candidates by Role
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.roleCounts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Conversion Funnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Conversion Funnel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Applied */}
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {analyticsData?.summary?.totalCandidates || 0}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Applied</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
          </div>
          
          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          
          {/* Interview */}
          <div className="text-center">
            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {analyticsData?.conversionRates?.appliedToInterview || 0}%
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Interview Rate</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Applied → Interview</p>
          </div>
          
          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          
          {/* Offer */}
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {analyticsData?.conversionRates?.interviewToOffer || 0}%
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Offer Rate</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Interview → Offer</p>
          </div>
        </div>
        
        {/* Conversion Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analyticsData?.statusCounts?.find(s => s.status === 'applied')?.count || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Currently Applied</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {analyticsData?.statusCounts?.find(s => s.status === 'interview')?.count || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Interview</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analyticsData?.statusCounts?.find(s => s.status === 'offer')?.count || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Offers Made</p>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Application Timeline ({timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={formatTimelineData(analyticsData?.timeline)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="applied"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Applied"
            />
            <Area
              type="monotone"
              dataKey="interview"
              stackId="1"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.6}
              name="Interview"
            />
            <Area
              type="monotone"
              dataKey="offer"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Offer"
            />
            <Area
              type="monotone"
              dataKey="rejected"
              stackId="1"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.6}
              name="Rejected"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Experience Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Experience Level Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData?.experienceDistribution || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="_id" 
              tickFormatter={(value) => {
                if (value === '30+') return '30+ years';
                if (value === 0) return '0-2 years';
                return `${value}-${value + 2} years`;
              }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, 'Candidates']}
              labelFormatter={(label) => {
                if (label === '30+') return '30+ years experience';
                if (label === 0) return '0-2 years experience';
                return `${label}-${label + 2} years experience`;
              }}
            />
            <Bar dataKey="count" fill="#8B5CF6" name="Candidates" />
          </BarChart>
        </ResponsiveContainer>
        {(!analyticsData?.experienceDistribution || analyticsData.experienceDistribution.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No experience data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
