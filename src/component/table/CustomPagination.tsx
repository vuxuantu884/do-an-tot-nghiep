import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Pagination } from "antd";
import { PageConfig } from "config/PageConfig";
import { BaseMetadata } from "model/response/base-metadata.response";
import { Link } from "react-router-dom";

type CustomPaginationProps = {
  metadata: BaseMetadata;
  onPageSizeChange?: (size: number) => void
  onPageChange?: (page: number) => void
};

const CustomPagination: React.FC<CustomPaginationProps> = (
  props: CustomPaginationProps
) => {
  const { metadata, onPageSizeChange} = props;
  return (
    <div className="yody-pagination yody-pagination-text">
      <span>
        Hiện thị kết quả: {" "}
        <span className="yody-pagination-bold">
          {metadata.page * metadata.limit + 1} -{" "}
          {(metadata.page + 1) * metadata.limit}
        </span>
        /<span>{metadata.total}</span> kết quả
      </span>
      <div className="pagination-right">
        <div className="page-size-view">
          Hiển thị số dòng:
          <Dropdown trigger={["click"]} placement="bottomCenter" overlay={
            <Menu>
              {
                PageConfig.map((item, index) => (
                  <Menu.Item disabled={metadata.limit === item} key="index" onClick={() => onPageSizeChange && onPageSizeChange(item)}>{item.toString()}</Menu.Item>
                ))
              }
            </Menu>
          }>
            <Link to="#" className="page-size-selected"  onClick={e => e.preventDefault()}>
              <div style={{color: '#2A2A86'}}>{metadata.limit}</div><DownOutlined />
            </Link>
          </Dropdown>
        </div>
        <Pagination
          size="small"
          pageSize={metadata.limit}
          current={metadata.page + 1}
          total={metadata.total}
        />
      </div>
    </div>

  );
};

export default CustomPagination;
