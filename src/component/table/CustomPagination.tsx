import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Pagination } from "antd";
import { PageConfig } from "config/PageConfig";
import { BaseMetadata } from "model/response/base-metadata.response";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

type CustomPaginationProps = {
  metadata: BaseMetadata;
  onChange?: (size: number, page: number) => void
};

const CustomPagination: React.FC<CustomPaginationProps> = (
  props: CustomPaginationProps
) => {
  const { metadata, onChange } = props;
  const numPage = useMemo(() => Math.floor(metadata.total / metadata.limit), [metadata.limit, metadata.total])
  const result = useMemo(() => {
    if (metadata.total <= 1) {
      return metadata.total;
    }
    let from = metadata.page * metadata.limit + 1;
    let to = (metadata.page + 1) * metadata.limit
    if (numPage === metadata.page) {
      let rest = metadata.total - from;
      to = from + rest;
    }
    return `${from} - ${to}`;
  }, [metadata.limit, metadata.page, metadata.total, numPage]);
  return (
    <div className="yody-pagination yody-pagination-text">
      {metadata.total !== 0 && (
        <React.Fragment>
          <span>
            Hiện thị kết quả: {" "}
            <span className="yody-pagination-bold">
              {result}
            </span>
            /<span>{metadata.total}</span> kết quả
            </span>
          {
            numPage > 0 && (
              <React.Fragment>
                <div className="pagination-right">
                  <div className="page-size-view">
                    Hiển thị số dòng:
                    <Dropdown trigger={["click"]} placement="bottomCenter" overlay={
                      <Menu>
                        {
                          PageConfig.map((item, index) => (
                            <Menu.Item disabled={metadata.limit === item} key={index} onClick={() => onChange && onChange(item, metadata.page)}>{item.toString()}</Menu.Item>
                          ))
                        }
                      </Menu>
                    }>
                      <Link to="#" className="page-size-selected" onClick={e => e.preventDefault()}>
                        <div style={{ color: '#2A2A86' }}>{metadata.limit}</div><DownOutlined />
                      </Link>
                    </Dropdown>
                  </div>
                  <Pagination
                    hideOnSinglePage
                    size="small"
                    pageSize={metadata.limit}
                    current={metadata.page + 1}
                    total={metadata.total}
                    className="yody-page"
                    onChange={(page, pageSize) => onChange && onChange(metadata.limit, page + 1)}
                  />
                </div>
              </React.Fragment>
            )
          }
        </React.Fragment>
      )}
    </div>
  );
};

export default CustomPagination;
