import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp({ apiKey: process.env.FIREBASE_API_KEY });
export const auth = getAuth(app);
