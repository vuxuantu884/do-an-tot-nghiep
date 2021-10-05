import { createContext } from "react";

type OrderCreateContextType = {
  store: {
    storeId: number | null;
    setStoreId: (value: number) => void | null;
  };
};
// tạo context
export const OrderCreateContext = createContext<OrderCreateContextType | null>(
  null
);
