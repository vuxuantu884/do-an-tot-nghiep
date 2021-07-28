import React, { useCallback } from "react";
import {
  Button,
  Pagination,
  Table as ANTTable,
  TableProps,
  Select,
} from "antd";
import { TableLocale, ColumnType } from "antd/lib/table/interface";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import classNames from "classnames";
import { PageConfig } from "config/PageConfig";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export interface ICustomTableProps extends Omit<TableProps<any>, "pagination"> {
  pagination?: false | ICustomTablePaginationConfig;
  onShowColumnSetting?: () => void;
  onSelectedChange?: (selectedRows: any[]) => void;
  isLoading?: boolean;
  showColumnSetting?: boolean;
}

export interface ICustomTableColumType<T> extends ColumnType<T> {
  visible: boolean;
}

export interface ICustomTablePaginationConfig {
  total?: number;
  disabled?: boolean;
  current?: number;
  pageSize?: number;
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

const showTotal = (pagination: ICustomTablePaginationConfig) => {
  let { total = 1, current = 1, pageSize = 1 } = pagination;
  let from = (current - 1) * pageSize + 1;
  let to = current * pageSize;
  if (from > total) {
    return "Không có kết quả";
  }
  if (to > total) to = total;
  return `${from} - ${to} trong tổng ${total}`;
};

const handleLastNextPage = (
  pagination: ICustomTablePaginationConfig,
  type: number
) => {
  const { current = 1, total = 1, pageSize = 1, onChange } = pagination;
  const totalPage = Math.ceil(total / pageSize);
  if (!onChange) return;

  if (type) {
    if (current === totalPage) return;
    return onChange(totalPage, pageSize);
  }

  if (current === 1) return;
  return onChange(1, pageSize);
};

const handleSizeChanger = (
  pagination: ICustomTablePaginationConfig,
  value: number
) => {
  const { current = 1, onShowSizeChange } = pagination;
  return onShowSizeChange && onShowSizeChange(current, value);
};

const CustomTableStyle2 = (props: ICustomTableProps) => {
  const {
    locale = defaultLocale,
    pagination = defaultPagination,
    columns,
    onSelectedChange,
    onShowColumnSetting,
    showColumnSetting,
    isLoading,
  } = props;

  const totalPage = pagination
    ? Math.ceil((pagination.total || 1) / (pagination.pageSize || 1))
    : 1;
  const configSettingColumns: ICustomTableColumType<any>[] = [
    {
      title: (
        <Button
          className="custom-table-setting-column"
          icon={<SettingOutlined />}
          onClick={onShowColumnSetting}
        />
      ),
      visible: true,
      key: "configColumn",
      width: 50,
    },
  ];
  const onSelect = useCallback(
    (item: any, selected: boolean, selectedRow: any[]) => {
      onSelectedChange && onSelectedChange(selectedRow);
    },
    [onSelectedChange]
  );
  const onSelectAll = useCallback(
    (selected, selectedRow: any[], changeRow: any[]) => {
      onSelectedChange && onSelectedChange(selectedRow);
    },
    [onSelectedChange]
  );
  return (
    <div className="custom-table">
      <ANTTable
        bordered
        {...props}
        rowSelection={{
          type: "checkbox",
          onSelect: onSelect,
          onSelectAll: onSelectAll,
        }}
        columns={
          showColumnSetting ? columns?.concat(configSettingColumns) : columns
        }
        locale={locale}
        loading={
          isLoading
            ? {
                indicator: (
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                ),
              }
            : false
        }
        pagination={false}
        // scroll={{ y: 700 }}
        size="middle"
      />
      {pagination && (
        <div className="custom-table-pagination">
          <div className="custom-table-pagination-left">
            <span className="custom-table-pagination-show-total">
              {showTotal(pagination)}
            </span>
          </div>

          <div className="custom-table-pagination-right">
            {pagination.showSizeChanger && (
              <div className="custom-table-pagination-size-change">
                <label htmlFor="custom-pagination-size-changer">
                  Hiển thị:{" "}
                </label>
                <Select
                  value={pagination.pageSize}
                  id="custom-pagination-size-changer"
                  onChange={(value: number) =>
                    handleSizeChanger(pagination, value)
                  }
                >
                  {pagination &&
                    PageConfig.map((size) => (
                      <Select.Option key={size} value={size}>
                        {size}
                      </Select.Option>
                    ))}
                </Select>
                <span>Kết quả</span>
              </div>
            )}
            <div className="custom-table-pagination-container">
              <li
                title="Trang đầu"
                className={classNames(
                  "ant-pagination-prev",
                  pagination.current &&
                    pagination.current === 1 &&
                    "ant-pagination-disabled"
                )}
              >
                <button
                  onClick={() => handleLastNextPage(pagination, 0)}
                  className="ant-pagination-item-link"
                  type="button"
                >
                  <DoubleLeftOutlined />
                  Trang đầu
                </button>
              </li>
              <Pagination
                total={pagination.total}
                current={pagination.current}
                pageSize={pagination.pageSize}
                onChange={pagination.onChange}
                showSizeChanger={false}
              />
              <li
                title="Trang cuối"
                className={classNames(
                  "ant-pagination-prev",
                  pagination.current &&
                    pagination.current === totalPage &&
                    "ant-pagination-disabled"
                )}
              >
                <button
                  onClick={() => handleLastNextPage(pagination, 1)}
                  className="ant-pagination-item-link"
                  type="button"
                >
                  <DoubleRightOutlined />
                  Trang cuối
                </button>
              </li>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CustomTableStyle2);
