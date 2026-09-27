// Firebase services used only by the admin panel (login and uploads). Kept out of src/lib/firebase.ts so
// the public site's main bundle doesn't include the Auth and Storage SDKs.
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import app from './firebase';

export const auth = getAuth(app);
export const storage = getStorage(app);
