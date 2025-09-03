import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ error }: { error: string }) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-red-700 dark:text-red-400">
        Error fetching data
      </p>
      <p className="mt-1 text-xs text-red-600 dark:text-red-300 break-words">
        {error}
      </p>
    </div>
  </div>
);

export default ErrorMessage;
