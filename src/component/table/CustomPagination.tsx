import { Button, Pagination } from "antd";
import { PageConfig } from "config/PageConfig";
import { BaseMetadata } from "model/response/base-metadata.response";

type CustomPaginationProps = {
  metadata: BaseMetadata;
};

const CustomPagination: React.FC<CustomPaginationProps> = (
  props: CustomPaginationProps
) => {
  const { metadata } = props;
  return (
    <div className="yody-pagination yody-pagination-text">
      <span>
        Hiện thị kết quả:
        <span className="yody-pagination-bold">
          {metadata.page * metadata.limit + 1} -{" "}
          {(metadata.page + 1) * metadata.limit}
        </span>{" "}
        /<span>{metadata.total}</span> kết quả
      </span>
      <span>Hiển thị số dòng</span>
      <Pagination
        size="small"
        pageSize={metadata.limit}
        current={metadata.page + 1}
        total={metadata.total}
      />
    </div>
  );
};

export default CustomPagination;
