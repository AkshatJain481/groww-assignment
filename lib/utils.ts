import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function flattenJson(
  obj: any,
  parent = "",
  res: { path: string; value: any }[] = [],
  showArrays = false
) {
  if (obj === null) return res;

  if (Array.isArray(obj)) {
    if (showArrays && parent) {
      res.push({ path: parent, value: obj });
    }
    // If arrays should not expand further when showArrays=true, stop here
    if (!showArrays) {
      obj.forEach((item, i) => {
        const newPath = `${parent}[${i}]`;
        flattenJson(item, newPath, res, showArrays);
      });
    }
    return res;
  }

  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const newPath = parent ? `${parent} -> ${k}` : k;

      if (["string", "number", "boolean"].includes(typeof v)) {
        // ✅ Push only the key, but keep value for preview
        res.push({ path: newPath, value: v });
      } else {
        flattenJson(v, newPath, res, showArrays);
      }
    }
    return res;
  }

  return res;
}

type PathInfo = { path: string; value: any };

export function extractArrayKeys(obj: any, parent: string = ""): PathInfo[] {
  let result: PathInfo[] = [];

  if (obj === null || obj === undefined) return result;

  if (Array.isArray(obj)) {
    // Collect all unique keys + one sample value for each
    const keySamples: Record<string, any> = {};

    obj.forEach((el) => {
      if (el && typeof el === "object" && !Array.isArray(el)) {
        for (const k of Object.keys(el)) {
          if (!(k in keySamples)) {
            keySamples[k] = el[k]; // store first seen value as sample
          }
        }
      }
    });

    for (const k in keySamples) {
      const val = keySamples[k];
      const type = Array.isArray(val) ? "array" : typeof val;
      const example =
        val !== null && typeof val === "object" ? "[object]" : val;

      const path = parent ? `${parent} -> ${k}` : `array -> ${k}`;
      result.push({ path, value: example });
    }

    // Recurse deeper into each element
    obj.forEach((el) => {
      if (el && typeof el === "object") {
        result = result.concat(extractArrayKeys(el, parent));
      }
    });
  } else if (typeof obj === "object") {
    for (const key in obj) {
      const newParent = parent ? `${parent} -> ${key}` : key;
      result = result.concat(extractArrayKeys(obj[key], newParent));
    }
  }

  return result;
}

export function formatChartPoints(data: any[], xPath: string, yPath: string) {
  const getValueByPath = (obj: any, path: string) => {
    return path.split(" -> ").reduce((acc, key) => acc?.[key], obj);
  };

  return data.map((item) => ({
    x: getValueByPath(item, xPath),
    y: getValueByPath(item, yPath),
  }));
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
