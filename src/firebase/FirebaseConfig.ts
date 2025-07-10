"use client";
import { Analytics, getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_APPID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);

let firebaseAnalytics: Analytics | undefined = undefined;
if (typeof window !== "undefined") {
    firebaseAnalytics = getAnalytics(firebaseApp);
}

firebaseAuth.useDeviceLanguage();

let firebaseUi: firebaseui.auth.AuthUI | null = null;
if (typeof window !== "undefined") {
    import("firebaseui").then((module) => {
        firebaseUi = new module.auth.AuthUI(firebaseAuth);
    });
}

export { firebaseUi, firebaseAnalytics };
