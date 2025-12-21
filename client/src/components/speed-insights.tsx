import { useEffect } from 'react';
import { injectSpeedInsights } from '@vercel/speed-insights';

/**
 * SpeedInsights component for Vercel Speed Insights integration
 * 
 * This component injects the Vercel Speed Insights tracking script
 * to monitor Web Vitals and performance metrics.
 * 
 * Should be added once to your app, preferably in the root component.
 */
export function SpeedInsights() {
  useEffect(() => {
    // Inject the Speed Insights script once on component mount
    injectSpeedInsights();
  }, []);

  return null;
}
