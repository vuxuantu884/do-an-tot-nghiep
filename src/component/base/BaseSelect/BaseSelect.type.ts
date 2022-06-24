import { ReactElement, ReactNode } from "react";
import { SelectProps } from "antd";
import { BaseMetadata } from "../../../model/base/base-metadata.response";
import {
  AccountPublicSearchQueryModel,
  MerchandiserSelectResponse,
} from "../../../model/account/account.model";

export type BaseSelectType<T> = SelectProps<any> & {
  children?: ReactNode;
  data?: T[];
  valueSearch?: string;
  renderItem?: (item: T, index: number) => void;
};

export type BaseSelectPagingType<T> = BaseSelectType<T> & {
  metadata: BaseMetadata;
  fetchData: (query: AccountPublicSearchQueryModel) => void;
  valueSearch?: string;
};

export type BaseSelectPaginationType = {
  page: number;
  totalPage: number;
  onChange: (type: "next" | "prev") => void;
  menu: ReactElement;
};

export type BaseSelectMerchandiserProps = SelectProps<any> & {
  merchans: MerchandiserSelectResponse;
  fetchMerchans: (query: AccountPublicSearchQueryModel) => void;
  isLoadingMerchans: boolean;
};
