"use client";

import { useState, useEffect } from 'react';
import { getAPIURL } from "../lib/apiClient";

export default function DebugInfo() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState('');
  
  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('luxygalleria_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserInfo(user);
      } catch (err) {
        console.error('Failed to parse user data');
      }
    }
    
    // Get API URL
    setApiUrl(getAPIURL());
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Debug Info</div>
      <div>API URL: {apiUrl}</div>
      <div>User Token: {userInfo?.token ? '✓' : '✗'}</div>
      <div>User ID: {userInfo?._id || 'None'}</div>
      <div>User Email: {userInfo?.email || 'None'}</div>
    </div>
  );
}