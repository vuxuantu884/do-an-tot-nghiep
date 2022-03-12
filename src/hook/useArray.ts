import { useState } from "react";
import { usePrevious } from "react-use";

export const useArray = (defaultValue: any[]) => {
  const [array, setArray] = useState(defaultValue);
  const prevArray = usePrevious(array);

  const push = (element: any) => {
    setArray((prevArr) => [...prevArr, element]);
  };
  const filter = (callback: any) => {
    setArray((prevArr) => prevArr.filter(callback));
  };
  const update = (index: number, newElement: any) => {
    setArray((prevArr) => [...prevArr.slice(0, index), newElement, ...prevArr.slice(index + 1, prevArr.length)]);
  };
  const remove = (index: number) => {
    setArray((prevArr) => [...prevArr.slice(0, index), ...prevArr.slice(index + 1, prevArr.length)]);
  };
  const clear = () => {
    setArray([]);
  };

  return { array, set: setArray, prevArray, push, filter, update, remove, clear };
};
