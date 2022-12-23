import React from "react";

type KDCompanyProviderValue = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
};

export const KDCompanyContext = React.createContext<KDCompanyProviderValue>(
  {} as KDCompanyProviderValue,
);

function KDCompanyProvider(props: { children: React.ReactNode }) {
  const [data, setData] = React.useState<any>([]);
  return (
    <KDCompanyContext.Provider
      {...props}
      value={{
        data,
        setData,
      }}
    />
  );
}

export default KDCompanyProvider;
