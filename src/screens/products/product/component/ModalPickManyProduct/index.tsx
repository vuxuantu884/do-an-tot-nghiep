import { SearchOutlined } from "@ant-design/icons";
import { Divider, Input, List, Modal, Checkbox } from "antd";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ProductItem from "./product-item";
import CustomPagination from "component/table/CustomPagination";

type PickManyProductModalType = {
  visible: boolean;
  onCancel: () => void;
  selected: Array<VariantResponse>;
  onSave: (result: Array<VariantResponse>) => void;
};

const PickManyProductModal: React.FC<PickManyProductModalType> = (
  props: PickManyProductModalType
) => {
  let initQuery = {
    info: "",
    page: 1,
    limit: 10,
  };
  const dispatch = useDispatch();
  const [data, setData] = useState<PageResponse<VariantResponse> | null>(null);
  const [selection, setSelection] = useState<Array<VariantResponse>>([]);
  const [query, setQuery] = useState<VariantSearchQuery>(initQuery);
  const [checked, setChecked] = useState<boolean>(false);

  const checkAll = useCallback((dataParam: PageResponse<VariantResponse>) => {
    let checkAll = true;
    dataParam?.items.forEach((item) => {
      if (selection.findIndex((selected) => selected.id === item.id) === -1) {
        checkAll = false;
      }
    })
    setChecked(checkAll);
  }, [selection]);

  const onResultSuccess = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (!!result) {
        setData(result);
        checkAll(result);
      }
    },
    [checkAll]
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
        //check all
        data && checkAll(data);
      } else {
        let index = selection.findIndex(
          (item) => item.id === variantResponse.id
        );
        if (index !== -1) {
          selection.splice(index, 1);
          setChecked(false);
        }
      }
      setSelection([...selection]);
    },
    [selection, checkAll, data]
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
        if (data) {
          data?.items.forEach((item) => {
            let index = selection.findIndex(
              (selected) => selected.id === item.id
            );
            if (index === -1) {
              selection.push(item);
            }
          })
          setSelection([...selection]);
        }
      } else {
        data?.items.forEach((item) => {
          let index = selection.findIndex(
            (selected) => selected.id === item.id
          );
          if (index !== -1) {
            selection.splice(index, 1);
          }
        });
        setSelection([...selection]);
      }
    },
    [data, setSelection, selection]
  );
  useEffect(() => {
    dispatch(searchVariantsRequestAction(query, onResultSuccess));
  }, [dispatch, onResultSuccess, query]);

  useEffect(() => {
    if (props.visible) {
      setSelection([...props.selected])
    }
  }, [props.selected, props.visible])

  return (
    <Modal
      visible={props.visible}
      cancelText="Thoát"
      okText="Thêm vào danh sách in"
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
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          fillAll(e.target.checked);
        }}
      >
        Chọn tất cả
      </Checkbox>
      <Divider />
      {data !== null && (
        <div className="modal-product-list">
          <List
            locale={{
              emptyText: "Không có dữ liệu",
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
              onChange: onPageChange
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default PickManyProductModal;
