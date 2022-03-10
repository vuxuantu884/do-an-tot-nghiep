import { useState } from "react";
import { usePrevious } from "react-use";

export const useArray = (defaultValue: any[]) => {
  const [array, setArray] = useState(defaultValue);
  const prevArray = usePrevious(array);

  const push = (element: any) => {
    setArray((e) => [...e, element]);
  };
  const filter = (callback: any) => {
    setArray((e) => e.filter(callback));
  };
  const update = (index: number, newElement: any) => {
    setArray((e) => [...e.slice(0, index), newElement, ...e.slice(index + 1, e.length)]);
  };
  const remove = (index: number) => {
    setArray((e) => [...e.slice(0, index), ...e.slice(index + 1, e.length)]);
  };
  const clear = () => {
    setArray([]);
  };

  return { array, set: setArray, prevArray, push, filter, update, remove, clear };
};
