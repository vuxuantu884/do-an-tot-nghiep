import { DoubleLeftOutlined, DoubleRightOutlined, SearchOutlined } from "@ant-design/icons";
import { Divider, Input, List, Modal, Pagination } from "antd";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import ProductItem from "../component/product-item";
import classNames from "classnames";

type PickManyProductModalType = {
  visible: boolean;
  onCancle: () => void;
  onSave: (result: Array<VariantResponse>) => void 
};



const PickManyProductModal: React.FC<PickManyProductModalType> = (
  props: PickManyProductModalType
) => {
  let initQuery = {
    info: "",
    page: 1,
    limit: 10,
    status: "active",
  }
  const dispatch = useDispatch();
  const [data, setData] = useState<PageResponse<VariantResponse> | null>(null);
  const [selection, setSelection] = useState<Array<VariantResponse>>([]);
  const [query, setQuery] = useState<VariantSearchQuery>(initQuery);
  const handleLastNextPage = (
    total: number, current: number, pageSize: number,
    type: number
  ) => {
    const totalPage = Math.ceil(total / pageSize);
   
  
    if (type) {
      if (current === totalPage) return;
      return onPageChange(totalPage, pageSize);
    }
  
    if (current === 1) return;
    return onPageChange(1, pageSize);
  };
  const showTotal = (total: number, current: number, pageSize: number) => {
    let from = (current - 1) * pageSize + 1;
    let to = current * pageSize;
    if (from > total) {
      return "Hiển thị kết quả: 0 kết quả";
    }
    if (to > total) to = total;
    return `Hiển thị kết quả: ${from}-${to} / ${total} kết quả`;
  };
  const onResultSuccess = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (!!result) {
        setData(result);
      }
    },
    []
  );
  const onCheckedChange = useCallback(
    (checked, variantResponse: VariantResponse) => {
      if (checked) {
        let index = selection.findIndex(
          (item) => item.id === variantResponse.id
        );
        if (index === -1) {
          selection.push(variantResponse);
        }
      } else {
        let index = selection.findIndex(
          (item) => item.id === variantResponse.id
        );
        if (index !== -1) {
          selection.splice(index, 1);
        }
      }
      setSelection([...selection]);
    },
    [selection]
  );
  const onPageChange = useCallback(
    (page, size) => {
      setQuery({ ...query, page: page, limit: size });
    },
    [query]
  );
  const totalPage = useMemo(() => {
    if(data === null) {
      return 0;
    }
    return Math.ceil(data.metadata.total / data.metadata.limit);
  }, [data]);
  useEffect(() => {
    dispatch(searchVariantsRequestAction(query, onResultSuccess));
  }, [dispatch, onResultSuccess, query]);
  return (
    <Modal
      visible={props.visible}
      cancelText="Thoát"
      okText="Thêm vào đơn"
      width={800}
      onCancel={() => {
        setSelection([]);
        setQuery(initQuery);
        props.onCancle && props.onCancle();
      }}
      onOk={() => {
        props.onSave && props.onSave(selection);
        setSelection([]);
      }}
      title="Chọn nhiều sản phẩm"
    >
      <Input
        value={query.info}
        onChange={(e) => {
          setQuery({ ...query, info: e.target.value });
        }}
        size="middle"
        className="yody-search"
        placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch"
        prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
      />
      <Divider />
      {data !== null && (
        <div className="modal-product-list">
          <List
            locale={{
              emptyText: 'Không có dữ liệu'
            }}
            className="product"
            style={{ maxHeight: 280, overflow: "auto" }}
            dataSource={data.items}
            rowKey={(item) => item.id.toString()}
            renderItem={(item) => (
              <ProductItem
                checked={
                  selection.findIndex((item1) => item.id === item1.id) !== -1
                }
                showCheckBox={true}
                data={item}
                onChange={(checked) => {
                  onCheckedChange(checked, item);
                }}
              />
            )}
          />
          <div className="custom-table-pagination">
            <div className="custom-table-pagination-left">
              <span className="custom-table-pagination-show-total">
                {showTotal(
                  data.metadata.total,
                  data.metadata.page,
                  data.metadata.limit
                )}
              </span>
            </div>
            <div className="custom-table-pagination-right">
              <div className="custom-table-pagination-container">
                <li
                  title="Trang đầu"
                  className={classNames(
                    "ant-pagination-prev",
                    data.metadata.page &&
                    data.metadata.page === 1 &&
                      "ant-pagination-disabled"
                  )}
                >
                  <button
                    onClick={() => handleLastNextPage(data.metadata.total, data.metadata.page, data.metadata.limit, 0)}
                    className="ant-pagination-item-link"
                    type="button"
                  >
                    <DoubleLeftOutlined />
                  </button>
                </li>
                <Pagination
                  total={data.metadata.total}
                  current={data.metadata.page}
                  pageSize={data.metadata.limit}
                  onChange={onPageChange}
                  showSizeChanger={false}
                />
                <li
                  title="Trang cuối"
                  className={classNames(
                    "ant-pagination-prev",
                    data.metadata.page &&
                    data.metadata.page === totalPage &&
                      "ant-pagination-disabled"
                  )}
                >
                  <button
                    onClick={() => handleLastNextPage(data.metadata.total, data.metadata.page, data.metadata.limit, 1)}
                    className="ant-pagination-item-link"
                    type="button"
                  >
                    <DoubleRightOutlined />
                  </button>
                </li>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PickManyProductModal;
