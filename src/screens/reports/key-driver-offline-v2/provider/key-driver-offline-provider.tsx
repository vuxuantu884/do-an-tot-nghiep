import React from "react";

type KeyDriverOfflineProviderValue = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
};

export const KeyDriverOfflineContext = React.createContext<KeyDriverOfflineProviderValue>(
  {} as KeyDriverOfflineProviderValue,
);

function KeyDriverOfflineProvider(props: { children: React.ReactNode }) {
  const [data, setData] = React.useState<any>([]);
  return (
    <KeyDriverOfflineContext.Provider
      {...props}
      value={{
        data,
        setData,
      }}
    />
  );
}

export default KeyDriverOfflineProvider;
