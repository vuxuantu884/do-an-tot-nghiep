import { SearchOutlined } from "@ant-design/icons";
import { Divider, Input, List, Modal, Checkbox, Skeleton } from "antd";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CustomPagination from "component/table/CustomPagination";
import ProductItem from "../component/product-item";
import { inventoryGetVariantByStoreAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";

type PickManyProductModalType = {
  visible: boolean;
  isTransfer?: boolean;
  onCancel: () => void;
  selected: Array<any>;
  onSave: (result: Array<VariantResponse>) => void;
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
  let initQueryHasStoreID = {
    status: "active",
    limit: 10,
    info: "",
    page: 1,
    store_ids: props.storeID,
  };
  const dispatch = useDispatch();
  const [data, setData] = useState<PageResponse<VariantResponse> | null>(null);
  const [selection, setSelection] = useState<Array<VariantResponse>>([]);
  const [query, setQuery] = useState<VariantSearchQuery>(
    props.storeID ? initQueryHasStoreID : initQuery
  );
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

  const fillAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        if (data) setSelection([...selection,...data?.items]);
      } else {
        setSelection([]);
      }
    },
    [data, selection]
  );

  useEffect(() => {
    if (props.storeID) {
      dispatch(inventoryGetVariantByStoreAction(query, onResultSuccess));
    } else {
      dispatch(searchVariantsRequestAction(query, onResultSuccess));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch"
        prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
      />
      <Divider />
      <Checkbox
        style={{ marginLeft: 12 }}
        // checked={selection.length === data?.metadata.limit}
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
                isTransfer={props.isTransfer}
                checked={
                  selection.findIndex((item1) => item.id === (item1.variant_id ?? item1.id)) !== -1
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
