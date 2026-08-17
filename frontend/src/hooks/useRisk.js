import { useState, useEffect } from 'react';
import { fetchRisk } from '../api/client';

export const useRisk = () => {
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const data = await fetchRisk();

        if (mounted) {
          setRiskData(data);
        }
      } catch (e) {
        console.error('Failed to fetch risk:', e);
      }
    };

    const interval = setInterval(poll, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { riskData };
};
