import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function flattenJson(
  obj: any,
  parent = "",
  res: { path: string; value: any }[] = []
) {
  if (obj === null) return res;

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const newPath = `${parent}[${i}]`;
      flattenJson(item, newPath, res);
    });
    return res;
  }

  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const newPath = parent ? `${parent} -> ${k}` : k;

      if (["string", "number", "boolean"].includes(typeof v)) {
        // ✅ Push only the key, but keep value for preview
        res.push({ path: newPath, value: v });
      } else {
        flattenJson(v, newPath, res);
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
    const keySamples: Record<string, any> = {};

    obj.forEach((el) => {
      if (el && typeof el === "object" && !Array.isArray(el)) {
        for (const k of Object.keys(el)) {
          if (!(k in keySamples)) keySamples[k] = el[k];
        }
      }
    });

    for (const k in keySamples) {
      const val = keySamples[k];
      const example =
        val !== null && typeof val === "object" ? "[object]" : val;
      const path = parent ? `${parent} -> ${k}` : `array -> ${k}`;
      result.push({ path, value: example });
    }

    obj.forEach((el) => {
      if (el && typeof el === "object") {
        // keep behavior: recurse with the same parent to continue discovery
        result = result.concat(extractArrayKeys(el, parent));
      }
    });

    return result;
  }

  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      const child = (obj as any)[key];
      const newParent = parent ? `${parent} -> ${key}` : key;

      if (child === null || child === undefined || typeof child !== "object") {
        result.push({ path: newParent, value: child });
        continue;
      }

      if (Array.isArray(child)) {
        result = result.concat(extractArrayKeys(child, newParent));
        continue;
      }

      const childKeys = Object.keys(child);
      const childVals = Object.values(child);

      if (
        childKeys.length > 1 &&
        childVals.every((v) => v && typeof v === "object" && !Array.isArray(v))
      ) {
        const first = (child as any)[childKeys[0]];
        for (const k of Object.keys(first)) {
          const val = first[k];
          const example =
            val !== null && typeof val === "object" ? "[object]" : val;
          result.push({ path: `${newParent} -> ${k}`, value: example });
        }
        continue;
      }

      if (
        childVals.length > 0 &&
        childVals.every((v) => v === null || typeof v !== "object")
      ) {
        for (const [k, v] of Object.entries(child)) {
          const example = v !== null && typeof v === "object" ? "[object]" : v;
          result.push({ path: `${newParent} -> ${k}`, value: example });
        }
        continue;
      }

      result = result.concat(extractArrayKeys(child, newParent));
    }
  }

  return result;
}

export function extractChartFields(obj: any, parent: string = ""): PathInfo[] {
  let result: PathInfo[] = [];

  if (obj === null || obj === undefined) return result;

  if (Array.isArray(obj)) {
    const sample = obj.find((el) => el && typeof el === "object");
    if (sample) {
      for (const [k, v] of Object.entries(sample)) {
        const value = typeof v === "object" ? "[object]" : v;
        const path = parent ? `${parent} -> ${k}` : k;
        result.push({ path, value });
      }
    }
    return result;
  }

  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      const child = obj[key];
      const newParent = parent ? `${parent} -> ${key}` : key;

      if (child && typeof child === "object" && !Array.isArray(child)) {
        const childKeys = Object.keys(child);
        const childVals = Object.values(child);

        if (
          childKeys.length > 1 &&
          childVals.every(
            (v) => v && typeof v === "object" && !Array.isArray(v)
          )
        ) {
          result.push({
            path: newParent,
            value: "[array-like]",
          });

          const first = child[childKeys[0]];
          for (const [k, v] of Object.entries(first)) {
            const value = typeof v === "object" ? "[object]" : v;
            result.push({
              path: `${newParent} -> ${k}`,
              value,
            });
          }
          continue;
        }
      }
      result = result.concat(extractChartFields(child, newParent));
    }
  }

  return result;
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

export function getNested(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = current[key];
  }
  return current;
}
