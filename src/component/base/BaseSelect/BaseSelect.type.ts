import { ReactElement, ReactNode } from "react";
import { SelectProps } from "antd";
import { BaseMetadata } from "../../../model/base/base-metadata.response";
import { AccountPublicSearchQuery } from "../../../model/account/account.model";

export type BaseSelectType<T> = SelectProps<any> & {
  children?: ReactNode;
  data?: T[];
  renderItem?: (item: T, index: number) => void;
};

export type BaseSelectPagingType<T> = BaseSelectType<T> & {
  metadata: BaseMetadata;
  fetchData: (query: AccountPublicSearchQuery) => void;
};

export type BaseSelectPaginationType = {
  page: number;
  totalPage: number;
  onChange: (type: "next" | "prev") => void;
  menu: ReactElement;
};
