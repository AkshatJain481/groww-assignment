import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddWidgetDialog from "./AddWidgetDialog";
import { ThemeToggle } from "./ui/theme-toggle";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b dark:border-zinc-700">
      <div className="flex h-14 items-center justify-between mx-[5%]">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <BarChart3 size={24} className="text-primary" />
          <span className="hidden font-bold sm:inline-block">
            Finance Dashboard
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Add Widget Button */}
          <AddWidgetDialog>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </AddWidgetDialog>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
