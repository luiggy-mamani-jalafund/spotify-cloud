import { firebaseAnalytics } from "@/firebase/FirebaseConfig";
import { logEvent } from "firebase/analytics";
import toast from "react-hot-toast";

interface PageViewParameters {
    page_title?: string;
    page_location?: string;
    page_path: string;
}

interface ButtonClickParameters {
    button_name: string;
    location?: string;
}

interface UseAnalyticsReturn {
    logPageView: (pageName: string, pageTitle?: string) => void;
    logButtonClick: (buttonName: string, location?: string) => void;
    isAnalyticsEnabled: boolean;
}

export const useAnalytics = (): UseAnalyticsReturn => {
    const isAnalyticsEnabled = firebaseAnalytics !== undefined;

    const logPageView = (pageName: string, pageTitle: string = ""): void => {
        if (firebaseAnalytics && typeof window !== "undefined") {
            const parameters: PageViewParameters = {
                page_title: pageTitle,
                page_location: window.location.href,
                page_path: pageName,
            };
            logEvent(firebaseAnalytics, "page_view", parameters);
        }
    };

    const logButtonClick = (
        buttonName: string,
        location: string = "",
    ): void => {
        if (firebaseAnalytics) {
            const parameters: ButtonClickParameters = {
                button_name: buttonName,
                location: location,
            };
            logEvent(firebaseAnalytics, "button_click", parameters);
        }
    };

    return {
        logPageView,
        logButtonClick,
        isAnalyticsEnabled,
    };
};
