// lib/locationPermission.ts
import { logVisitor } from './analytics';

export const requestLocationAndLog = async () => {
  // Never log admin page visits
  if (window.location.pathname.startsWith('/admin')) return;

  if (!('geolocation' in navigator)) {
    await logVisitor(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      console.log('Location permission granted ✅');
      await logVisitor(true, position.coords);
    },
    async (error) => {
      console.log('Location denied or error:', error.message);
      await logVisitor(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    }
  );
};

