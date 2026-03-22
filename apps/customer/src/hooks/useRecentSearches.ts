import { useEffect, useState } from "react";

const RECENT_SEARCHES_KEY = "gutzo_recent_searches";
const MAX_RECENT_SEARCHES = 8;

export function useRecentSearches() {
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load initial state from local storage and setup global listener
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to parse recent searches", e);
        }

        const handleSaveEvent = (e: CustomEvent<string>) => {
            const trimmed = e.detail?.trim();
            if (!trimmed) return;

            setRecentSearches((prev) => {
                const filtered = prev.filter((item) =>
                    item.toLowerCase() !== trimmed.toLowerCase()
                );
                const updated = [trimmed, ...filtered].slice(
                    0,
                    MAX_RECENT_SEARCHES,
                );
                try {
                    localStorage.setItem(
                        RECENT_SEARCHES_KEY,
                        JSON.stringify(updated),
                    );
                } catch (e) {}
                return updated;
            });
        };

        window.addEventListener(
            "save-recent-search",
            handleSaveEvent as EventListener,
        );
        return () => {
            window.removeEventListener(
                "save-recent-search",
                handleSaveEvent as EventListener,
            );
        };
    }, []);

    const addSearch = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        setRecentSearches((prev) => {
            // Remove duplicate if it exists, add to front
            const filtered = prev.filter((item) =>
                item.toLowerCase() !== trimmed.toLowerCase()
            );
            const updated = [trimmed, ...filtered].slice(
                0,
                MAX_RECENT_SEARCHES,
            );

            try {
                localStorage.setItem(
                    RECENT_SEARCHES_KEY,
                    JSON.stringify(updated),
                );
            } catch (e) {
                console.error("Failed to save recent searches", e);
            }

            return updated;
        });
    };

    const removeSearch = (query: string) => {
        setRecentSearches((prev) => {
            const updated = prev.filter((item) =>
                item.toLowerCase() !== query.toLowerCase()
            );
            try {
                localStorage.setItem(
                    RECENT_SEARCHES_KEY,
                    JSON.stringify(updated),
                );
            } catch (e) {
                console.error("Failed to save recent searches", e);
            }
            return updated;
        });
    };

    const clearSearches = () => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch (e) {
            console.error("Failed to clear recent searches", e);
        }
    };

    return {
        recentSearches,
        addSearch,
        removeSearch,
        clearSearches,
    };
}
