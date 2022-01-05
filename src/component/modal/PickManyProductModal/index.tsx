import { SearchOutlined } from "@ant-design/icons";
import { Divider, Input, List, Modal, Checkbox, Skeleton } from "antd";
import { searchProductWrapperRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  ProductResponse,
  ProductWrapperSearchQuery,
} from "model/product/product.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CustomPagination from "component/table/CustomPagination";
import ProductItem from "component/custom/ProductItem";

type PickManyProductModalType = {
  visible: boolean;
  isTransfer?: boolean;
  onCancel: () => void;
  selected: Array<any>;
  onSave: (result: Array<ProductResponse>) => void;
  storeID?: number;
  emptyText?:string
};

let initQuery = {
  info: "",
  page: 1,
  limit: 10,
};

const PickManyProductModal: React.FC<PickManyProductModalType> = (
  props: PickManyProductModalType
) => { 
  const dispatch = useDispatch();
  const [data, setData] = useState<PageResponse<ProductResponse> | null>(null);
  const [selection, setSelection] = useState<Array<ProductResponse>>([]);
  const [query, setQuery] = useState<ProductWrapperSearchQuery>(
    initQuery
  );
  const onResultSuccess = useCallback(
    (result: PageResponse<ProductResponse> | false) => {
      if (!!result) {
        setData(result);
      }
    },
    []
  );
  const onCheckedChange = useCallback(
    (checked, ProductResponse: ProductResponse) => {
      if (checked) {
        let index = selection.findIndex(
          (item) => item.id === ProductResponse.id
        );
        if (index === -1) {
          selection.push(ProductResponse);
        }
      } else {
        let index = selection.findIndex(
          (item) => item.id === ProductResponse.id
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

  const fillAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        if (data) setSelection(selection.concat(data?.items));
      } else {
        const tempSelection = [...selection];
        data?.items.forEach(item => {
          const removedIndex = tempSelection.findIndex(s => s.id === item.id)
          tempSelection.splice(removedIndex, 1);
        })
        setSelection([...tempSelection]);
      }
    },
    [data, selection]
  );

  useEffect(() => {
    dispatch(searchProductWrapperRequestAction(query, onResultSuccess));
  }, [dispatch, onResultSuccess, query]);

  useEffect(() => {
    if (props.visible) {
      setSelection([...props.selected]);
    }
  }, [props.selected, props.visible]);

  return (
    <Modal
      visible={props.visible}
      cancelText="Thoát"
      okText="Thêm sản phẩm"
      width={1000}
      onCancel={() => {
        setSelection([]);
        setQuery(initQuery);
        props.onCancel && props.onCancel();
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
        placeholder="Tìm kiếm sản phẩm theo tên, mã SKU"
        prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
      />
      <Divider />
      <Checkbox
        style={{ marginLeft: 12 }}
        checked={data?.items.every(item => selection.findIndex(s => s.id === item.id) > -1)}
        onChange={(e) => {
          fillAll(e.target.checked);
        }}
      >
        Chọn tất cả
      </Checkbox>
      <Divider />
      {data !== null ? (
        <div className="modal-product-list">
          <List
            locale={{
              emptyText: props.emptyText ? props.emptyText : "Không có dữ liệu",
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
          <CustomPagination
            pagination={{
              showSizeChanger: false,
              pageSize: data.metadata.limit,
              current: data.metadata.page,
              total: data.metadata.total,
              onChange: onPageChange,
            }}
          />
        </div>
      ) : (
        <Skeleton loading={true} active avatar></Skeleton>
      )}
    </Modal>
  );
};

export default PickManyProductModal;
