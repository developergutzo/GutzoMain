import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useRouter } from "../components/Router";

export function useMobileNavigation() {
    const { currentRoute, goBack } = useRouter();

    useEffect(() => {
        let backListener: any;

        const setupListener = async () => {
            try {
                backListener = await App.addListener("backButton", (data) => {
                    // If we are on the home page, exit app
                    if (currentRoute === "/" || window.history.length <= 1) {
                        App.exitApp();
                    } else {
                        // Otherwise go back
                        // Check if we are in a modal/overlay state?
                        // The hook normally just handles route navigation.
                        // Modal closing is usually handled by the modal itself capturing back button if properly set up,
                        // but for now we focus on route back.
                        goBack();
                    }
                });
            } catch (error) {
                console.warn(
                    "Back button listener failed setup (not native?)",
                    error,
                );
            }
        };

        setupListener();

        return () => {
            if (backListener) {
                backListener.remove();
            }
        };
    }, [currentRoute, goBack]);
}
