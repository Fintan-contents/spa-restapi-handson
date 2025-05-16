'use client';
import React, {useEffect, useState} from 'react';
import {BackendService} from '../backend/BackendService';

const AppInitializer: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    BackendService.refreshCsrfToken().finally(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return <React.Fragment />;
  }

  return children;
};

export default AppInitializer;
