import { Select, SelectItem } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSelect = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // hydration mismatch 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Select
      label="Theme"
      defaultSelectedKeys={[theme || "system"]}
      onChange={(e) => setTheme(e.target.value)}
      size="sm"
      variant="bordered"
      className="w-[200px]"
    >
      <SelectItem key="light" value="light">
        Light
      </SelectItem>
      <SelectItem key="dark" value="dark">
        Dark
      </SelectItem>
      <SelectItem key="system" value="system">
        System
      </SelectItem>
    </Select>
  );
};

export default ThemeSelect;
