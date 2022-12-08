import { SearchOutlined } from "@ant-design/icons";
import { Divider, Input, List, Modal, Checkbox } from "antd";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ProductItem from "./ProductItem";
import CustomPagination from "component/table/CustomPagination";

type PickManyProductModalType = {
  visible: boolean;
  onCancel: () => void;
  selected: Array<VariantResponse>;
  onSave: (result: Array<VariantResponse>) => void;
};

const PickManyProductModal: React.FC<PickManyProductModalType> = (
  props: PickManyProductModalType,
) => {
  const { visible, onCancel, selected, onSave } = props;
  const initQuery = {
    info: "",
    page: 1,
    limit: 10,
  };
  const dispatch = useDispatch();
  const [data, setData] = useState<PageResponse<VariantResponse> | null>(null);
  const [selection, setSelection] = useState<Array<VariantResponse>>([]);
  const [query, setQuery] = useState<VariantSearchQuery>(initQuery);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const checkAll = useCallback(
    (dataParam: PageResponse<VariantResponse>) => {
      let checkAll = true;
      dataParam?.items.forEach((item) => {
        if (selection.findIndex((selected) => selected.id === item.id) === -1) {
          checkAll = false;
        }
      });
      setIsChecked(checkAll);
    },
    [selection],
  );

  const onResultSuccess = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (!!result) {
        setData(result);
        checkAll(result);
      }
    },
    [checkAll],
  );

  const changeCheckedProduct = useCallback(
    (checked, variantResponse: VariantResponse) => {
      if (checked) {
        const index = selection.findIndex((item) => item.id === variantResponse.id);
        if (index === -1) {
          selection.push(variantResponse);
        }
        //check all
        data && checkAll(data);
      } else {
        const index = selection.findIndex((item) => item.id === variantResponse.id);
        if (index !== -1) {
          selection.splice(index, 1);
          setIsChecked(false);
        }
      }
      setSelection([...selection]);
    },
    [selection, checkAll, data],
  );
  const changePage = useCallback(
    (page, size) => {
      setQuery({ ...query, page: page, limit: size });
    },
    [query],
  );

  const fillAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        if (data) {
          data?.items.forEach((item) => {
            const index = selection.findIndex((selected) => selected.id === item.id);
            if (index === -1) {
              selection.push(item);
            }
          });
          setSelection([...selection]);
        }
      } else {
        data?.items.forEach((item) => {
          const index = selection.findIndex((selected) => selected.id === item.id);
          if (index !== -1) {
            selection.splice(index, 1);
          }
        });
        setSelection([...selection]);
      }
    },
    [data, setSelection, selection],
  );

  useEffect(() => {
    dispatch(searchVariantsRequestAction(query, onResultSuccess));
  }, [dispatch, onResultSuccess, query]);

  useEffect(() => {
    if (visible) {
      setSelection([...selected]);
    }
  }, [selected, visible]);

  return (
    <Modal
      visible={visible}
      cancelText="Thoát"
      okText="Thêm vào danh sách in"
      width={1000}
      onCancel={() => {
        setSelection([]);
        setQuery(initQuery);
        onCancel && onCancel();
      }}
      onOk={() => {
        onSave && onSave(selection);
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
        checked={isChecked}
        onChange={(e) => {
          setIsChecked(e.target.checked);
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
                isChecked={selection.findIndex((item1) => item.id === item1.id) !== -1}
                isShowCheckBox
                data={item}
                onChange={(checked) => {
                  changeCheckedProduct(checked, item);
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
              onChange: changePage,
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default PickManyProductModal;
