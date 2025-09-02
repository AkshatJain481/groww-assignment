import { memo, useMemo, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { extractArrayKeys, flattenJson } from "@/lib/utils";

const ApiDataTable = memo(
  ({
    apiData = [],
    handleAddField,
    filterFields,
    type,
  }: {
    apiData: any;
    handleAddField: (path: string, value: any) => void;
    filterFields: string;
    type: "table" | "card" | "chart";
  }) => {
    const [cleanData, setCleanData] = useState<
      { path: string; value: any }[] | null
    >(null);

    useEffect(() => {
      if (type == "card") {
        setCleanData(flattenJson(apiData));
      } else {
        setCleanData(extractArrayKeys(apiData));
      }
    }, [apiData, type]);

    const searchWords = useMemo(
      () => filterFields.toLowerCase().split(/\s+/).filter(Boolean),
      [filterFields]
    );

    const filteredData = useMemo(() => {
      if (!cleanData) return [];
      if (searchWords.length === 0) return cleanData;

      return cleanData.filter((item: { path: string; value: any }) =>
        searchWords.every((word) => item.path.toLowerCase().includes(word))
      );
    }, [cleanData, searchWords]);

    const highlightText = (text: string) => {
      if (searchWords.length === 0) return text;

      const regex = new RegExp(`(${searchWords.join("|")})`, "gi");
      return text.split(regex).map((part, i) =>
        searchWords.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-yellow-300 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      );
    };

    return (
      <div
        className="h-[25vh] overflow-auto rounded-lg border text-sm p-2"
        id="available-fields"
      >
        {filteredData && filteredData.length > 0 ? (
          filteredData.map(({ path, value }: { path: string; value: any }) => (
            <div
              key={path}
              className="flex items-center justify-between p-4 hover:dark:bg-zinc-600 cursor-pointer rounded-lg"
              onClick={() => handleAddField(path, value)}
            >
              <div className="space-y-2">
                <p className="font-mono">{highlightText(path)}</p>
                <p className="text-xs text-gray-400">
                  ({typeof value}) : {String(value)}
                </p>
              </div>
              <Plus size={20} />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Fields available for this display mode!
          </div>
        )}
      </div>
    );
  }
);

export default ApiDataTable;
