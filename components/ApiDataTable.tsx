import { memo, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { extractArrayKeys, flattenJson } from "@/lib/utils";

type ApiDataTableProps = {
  apiData: unknown;
  handleAddField: (path: string, value: unknown) => void;
  filterFields: string;
  type: "table" | "card" | "chart";
};

type FlattenedItem = { path: string; value: unknown };

const ApiDataTable = memo(
  ({ apiData, handleAddField, filterFields, type }: ApiDataTableProps) => {
    const cleanData = useMemo<FlattenedItem[]>(() => {
      if (!apiData) return [];
      return type === "card" ? flattenJson(apiData) : extractArrayKeys(apiData);
    }, [apiData, type]);

    const searchWords = useMemo(
      () => filterFields.toLowerCase().split(/\s+/).filter(Boolean),
      [filterFields]
    );

    const highlightRegex = useMemo(() => {
      if (searchWords.length === 0) return null;
      return new RegExp(`(${searchWords.join("|")})`, "gi");
    }, [searchWords]);

    const filteredData = useMemo(() => {
      if (searchWords.length === 0) return cleanData;
      return cleanData.filter((item) =>
        searchWords.every((word) => item.path.toLowerCase().includes(word))
      );
    }, [cleanData, searchWords]);

    const highlightText = useCallback(
      (text: string) => {
        if (!highlightRegex) return text;

        return text.split(highlightRegex).map((part, i) =>
          highlightRegex.test(part) ? (
            <mark key={i} className="bg-yellow-300 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        );
      },
      [highlightRegex]
    );

    const handleClick = useCallback(
      (path: string, value: unknown) => () => {
        handleAddField(path, value);
      },
      [handleAddField]
    );

    return (
      <div
        className="h-[25vh] overflow-auto rounded-lg border text-sm p-2"
        id="available-fields"
      >
        {filteredData.length > 0 ? (
          <ul className="space-y-2">
            {filteredData.map(({ path, value }) => (
              <li
                key={path}
                role="button"
                tabIndex={0}
                className="flex items-center justify-between p-3 hover:dark:bg-zinc-600 cursor-pointer rounded-lg"
                onClick={handleClick(path, value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddField(path, value)
                }
              >
                <div className="space-y-1">
                  <p className="font-mono break-all">{highlightText(path)}</p>
                  <p className="text-xs text-gray-400">
                    ({typeof value}) : {String(value)}
                  </p>
                </div>
                <Plus size={20} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No fields available for this display mode!
          </div>
        )}
      </div>
    );
  }
);

export default ApiDataTable;
