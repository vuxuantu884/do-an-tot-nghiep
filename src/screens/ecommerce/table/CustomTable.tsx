import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Table as ANTTable, TableProps } from "antd";
import { ColumnType, TableLocale } from "antd/lib/table/interface";
import { PageConfig } from "config/page.config";
import React, { useCallback } from "react";
import CustomPagination from "component/table/CustomPagination";

export interface ICustomTableProps extends Omit<TableProps<any>, "pagination"> {
  pagination?: false | ICustomTablePaginationConfig;
  onShowColumnSetting?: () => void;
  onSelectedChange?: (selectedRows: any[]) => void;
  isLoading?: boolean;
  showColumnSetting?: boolean;
  isRowSelection?: boolean;
  selectedRowKey?: any[];
  onChangeRowKey?: (rowKey: any[]) => void;
}

export interface ICustomTableColumType<T> extends ColumnType<T> {
  visible?: boolean;
}

export interface ICustomTablePaginationConfig {
  total: number;
  disabled?: boolean;
  current?: number;
  pageSize: number;
  onChange?: (page: number, pageSize?: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  onShowSizeChange?: (current: number, size: number) => void;
  style?: React.CSSProperties;
  className?: string;
}

const defaultLocale: TableLocale = {
  emptyText: "Không có bản ghi nào",
  filterEmptyText: "Không tìm thấy bản ghi nào",
  selectNone: "Bỏ chọn",
  selectAll: "Chọn tất cả",
  cancelSort: "Loại bỏ sắp xếp",
  triggerAsc: "Sắp xếp tăng dần",
  triggerDesc: "Sắp xếp giảm dần",
};

const defaultPagination: ICustomTablePaginationConfig = {
  current: 1,
  total: 1,
  pageSize: 50,
  showSizeChanger: true,
  pageSizeOptions: PageConfig,
};

const CustomTable = (props: ICustomTableProps) => {
  const {
    locale = defaultLocale,
    pagination = defaultPagination,
    columns,
    onSelectedChange,
    showColumnSetting,
    isLoading,
    isRowSelection,
    selectedRowKey,
    onChangeRowKey,
  } = props;

  const configSettingColumns: ICustomTableColumType<any>[] = [];
  const onSelect = useCallback(
    (item: any, selected: boolean, selectedRow: any[]) => {
      onSelectedChange && onSelectedChange(selectedRow);
    },
    [onSelectedChange],
  );
  const onSelectAll = useCallback(
    (selected, selectedRow: any[], changeRow: any[]) => {
      onSelectedChange && onSelectedChange(selectedRow);
    },
    [onSelectedChange],
  );
  return (
    <div className="custom-table">
      <ANTTable
        {...props}
        rowSelection={
          isRowSelection
            ? {
                selectedRowKeys: selectedRowKey,
                type: "checkbox",
                onSelect: onSelect,
                onSelectAll: onSelectAll,
                onChange: onChangeRowKey,
                columnWidth: 60,
              }
            : undefined
        }
        columns={showColumnSetting ? columns?.concat(configSettingColumns) : columns}
        locale={locale}
        loading={
          isLoading
            ? {
                indicator: <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />,
              }
            : false
        }
        pagination={false}
        size="middle"
      />
      {pagination && <CustomPagination pagination={pagination} />}
    </div>
  );
};

export default React.memo(CustomTable);
