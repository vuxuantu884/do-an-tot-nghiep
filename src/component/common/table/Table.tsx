import React from "react";
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

export interface ICustomTableProps extends Omit<TableProps<any>, "pagination"> {
  pagination?: false | ICustomTablePaginationConfig;
  showColumnSetting?: boolean;
  onShowColumnSetting?: () => void;
}

export interface ICustomTableColumType<T> extends ColumnType<T> { }

export interface ICustomTablePaginationConfig {
  total?: number;
  disabled?: boolean;
  current?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize?: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  onShowSizeChange?: (current: number, size: number) => void;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const defaultLocale: TableLocale = {
  emptyText: "Không có bản ghi nào",
  filterEmptyText: "Không tìm thấy bản ghi nào",
  selectNone: "Bỏ chọn",
  selectAll: "Chọn tất cả",
};

const defaultPagination: ICustomTablePaginationConfig = {
  current: 1,
  total: 1,
  pageSize: 50,
  showTotal: (total, [from, to]) =>
    `Hiển thị kết quả: ${from}-${to} / ${total} kết quả`,
  showSizeChanger: true,
  pageSizeOptions: ["5", "10", "20", "50", "100", "200"],
};

const showTotal = (pagination: ICustomTablePaginationConfig) => {
  let { total = 1, current = 1, pageSize = 1 } = pagination;
  let from = (current - 1) * pageSize + 1;
  let to = current * pageSize;
  if (to > total) to = total;

  return pagination.showTotal && pagination.showTotal(total, [from, to]);
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

export const Table = (props: ICustomTableProps) => {
  const {
    locale = defaultLocale,
    pagination = defaultPagination,
    columns,
    showColumnSetting,
    onShowColumnSetting,
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
      key: "configColumn",
      width: 50,
    },
  ];

  return (
    <div className="custom-table">
      <ANTTable
        {...props}
        columns={
          showColumnSetting ? columns?.concat(configSettingColumns) : columns
        }
        locale={locale}
        pagination={false}
      />
      {pagination && (
        <div className="custom-table-pagination">
          {pagination.showTotal && (
            <div className="custom-table-pagination-left">
              <span className="custom-table-pagination-show-total">
                {showTotal(pagination)}
              </span>
            </div>
          )}
          <div className="custom-table-pagination-right">
            {pagination.showSizeChanger && (
              <div className="custom-table-pagination-size-change">
                <label htmlFor="custom-pagination-size-changer">
                  Hiển thị số dòng:{" "}
                </label>
                <Select
                  value={pagination.pageSize}
                  id="custom-pagination-size-changer"
                  onChange={(value: number) =>
                    handleSizeChanger(pagination, value)
                  }
                >
                  {pagination &&
                    pagination.pageSizeOptions?.map((size) => (
                      <Select.Option key={size} value={size}>{size}</Select.Option>
                    ))}
                </Select>
              </div>
            )}
            <div className="custom-table-pagination-container">
              <li
                title="First Page"
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
                title="First Page"
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
                </button>
              </li>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
