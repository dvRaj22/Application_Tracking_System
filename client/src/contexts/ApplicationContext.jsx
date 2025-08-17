import React, { createContext, useContext, useState, useCallback } from 'react';

const ApplicationContext = createContext();

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplicationContext must be used within an ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshApplications = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const updateApplicationStatus = useCallback((applicationId, newStatus) => {
    setApplications(prev => 
      prev.map(app => 
        app._id === applicationId 
          ? { ...app, status: newStatus }
          : app
      )
    );
    refreshApplications();
  }, [refreshApplications]);

  const addApplication = useCallback((application) => {
    setApplications(prev => [...prev, application]);
    refreshApplications();
  }, [refreshApplications]);

  const updateApplication = useCallback((applicationId, updatedData) => {
    setApplications(prev => 
      prev.map(app => 
        app._id === applicationId 
          ? { ...app, ...updatedData }
          : app
      )
    );
    refreshApplications();
  }, [refreshApplications]);

  const deleteApplication = useCallback((applicationId) => {
    setApplications(prev => prev.filter(app => app._id !== applicationId));
    refreshApplications();
  }, [refreshApplications]);

  const value = {
    applications,
    setApplications,
    refreshTrigger,
    refreshApplications,
    updateApplicationStatus,
    addApplication,
    updateApplication,
    deleteApplication
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};
