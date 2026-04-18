import { useEffect } from "react";

/** Faqat bu prefikslar ostidagi layoutlarda (admin emas) sahifadan nusxa olish bloklanadi. */
const COPY_BLOCK_PATH_PREFIXES = [
    "/supplier",
    "/operator",
    "/call-operator",
    "/lotcreator",
    "/superadmin",
];

function allowCopyFromActiveElement() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    return false;
}

function shouldBlockAmbientCopy(pathname) {
    return COPY_BLOCK_PATH_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
}

export default function useGlobalHotkeys() {
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName;

            const isCopyChord =
                (e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C");
            if (
                isCopyChord &&
                !allowCopyFromActiveElement() &&
                shouldBlockAmbientCopy(window.location.pathname)
            ) {
                e.preventDefault();
                return;
            }

            if (tag === "INPUT" || tag === "TEXTAREA") return;

            if (e.key === "/") {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("focusSearch"));
            }
        };

        const handleCopy = (e) => {
            if (
                !allowCopyFromActiveElement() &&
                shouldBlockAmbientCopy(window.location.pathname)
            ) {
                e.preventDefault();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("copy", handleCopy);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("copy", handleCopy);
        };
    }, []);
}