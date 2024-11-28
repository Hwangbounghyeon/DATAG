import { useState } from "react";

export function usePanelState() {
    const [activePanel, setActivePanel] = useState<"class" | "metadata">(
        "class"
    );

    return {
        activePanel,
        setActivePanel,
    };
}
