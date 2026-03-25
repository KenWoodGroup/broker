import { useEffect } from "react";

export default function useGlobalHotkeys() {
    useEffect(() => {
        const handleKeyDown = (e) => {
            
            const tag = document.activeElement?.tagName;

            if (tag === "INPUT" || tag === "TEXTAREA") return;

            if (e.key === "/") {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("focusSearch"));
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
}