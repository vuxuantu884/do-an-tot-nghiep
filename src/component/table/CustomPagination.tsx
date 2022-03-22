import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Col, Pagination, Row, Select, TableProps } from "antd";
import classNames from "classnames";
import { PageConfig } from "config/page.config";
import React from "react";

interface ICustomPaginationProps extends Omit<TableProps<any>, "pagination"> {
  pagination?: false | ICustomTablePaginationConfig;
}

interface ICustomTablePaginationConfig {
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
  const { current = 1, total = 1, onShowSizeChange } = pagination;
  const totalPage = Math.ceil(total / value);
  return (
    onShowSizeChange &&
    onShowSizeChange(current > totalPage ? 1 : current, value)
  );
};

const CustomPagination = (props: ICustomPaginationProps) => {
  const { pagination = defaultPagination } = props;

  const totalPage = pagination
    ? Math.ceil((pagination.total || 1) / (pagination.pageSize || 1))
    : 1;
  return (
    <React.Fragment>
      {pagination && (
        <div className="custom-table-pagination">
          <Row justify="space-between">
            <Col span={6}>
              <span className="custom-table-pagination__showTotal">
                {showTotal(pagination)}
              </span>
            </Col>
            {pagination.showSizeChanger && (
              <Col span={6}>
                <div className="custom-table-pagination__sizeChange">
                  <label
                    htmlFor="custom-pagination-size-changer"
                    style={{ marginRight: 4 }}
                  >
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
                  <span style={{ marginLeft: 10 }}>Kết quả</span>
                </div>
              </Col>
            )}
            <Col span={pagination.showSizeChanger ? 12 : 18}>
              <div className="custom-table-pagination__main">
                <div title="Trang đầu" className="ant-pagination-first">
                  <button
                    onClick={() => handleLastNextPage(pagination, 0)}
                    className={classNames(
                      "ant-pagination-item ant-pagination-item-link",
                      pagination.current &&
                        pagination.current === 1 &&
                        "ant-pagination-disabled"
                    )}
                    disabled={pagination?.current === 1}
                    type="button"
                  >
                    <LeftOutlined style={{ marginRight: 5 }} />
                    Trang đầu
                  </button>
                </div>
                <Pagination
                  total={pagination.total}
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  onChange={pagination.onChange}
                  onShowSizeChange={pagination.onShowSizeChange}
                  showSizeChanger={false}
                />
                <div title="Trang cuối" className="ant-pagination-last">
                  <button
                    onClick={() => handleLastNextPage(pagination, 1)}
                    className={classNames(
                      "ant-pagination-item ant-pagination-item-link",
                      pagination.current &&
                        pagination.current === totalPage &&
                        "ant-pagination-disabled"
                    )}
                    disabled={pagination?.current === totalPage}
                    type="button"
                  >
                    Trang cuối
                    <RightOutlined style={{ marginLeft: 5 }} />
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </React.Fragment>
  );
};

export default React.memo(CustomPagination);
