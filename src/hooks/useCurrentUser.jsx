import { useEffect, useState, useCallback } from 'react';
import { useHttpClient } from './HttpHook';
import { useLogin } from '../context/AuthContext';

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState();
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { sendRequest, isLoading, error } = useHttpClient();
  const { token } = useLogin();

  const fetchCurrentUser = useCallback(async () => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/user`,
        'GET',
        null,
        {
          Authorization: `Bearer ${token}`
        }
      );
      setCurrentUser(responseData.user);
    } catch (err) {
      console.log('Failed to fetch current user:');
      setCurrentUser(null);
    }
  }, [token, sendRequest]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    currentUser,
    isLoading,
    error,
    refetch
  };
};