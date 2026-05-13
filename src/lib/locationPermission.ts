// lib/locationPermission.ts
import { logVisitor } from './analytics';

export const requestLocationAndLog = async () => {
  // Never log admin page visits
  if (window.location.pathname.startsWith('/admin')) return;

  if (!('geolocation' in navigator)) {
    await logVisitor(false);
    return;
  }

  // Delay for 5 seconds before asking for permission
  await new Promise((resolve) => setTimeout(resolve, 5000));

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      if (import.meta.env.DEV) {
        console.log('Location permission granted');
      }
      await logVisitor(true, position.coords);
    },
    async (error) => {
      if (import.meta.env.DEV) {
        console.log('Location denied or error:', error.message);
      }
      await logVisitor(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    }
  );
};
