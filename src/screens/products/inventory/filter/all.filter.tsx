import { Button, Form, Input, Tag } from "antd";
import CustomSelect from "component/custom/select.custom";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { StoreResponse } from "model/core/store.model";
import { InventoryQuery } from "model/inventory";
import React, { useCallback, useEffect, useState } from "react";
import search from "assets/img/search.svg";
import {
  InventoryQueryField,
} from "model/inventory/field";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";

export interface InventoryFilterProps {
  params: InventoryQuery;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: InventoryQuery) => void;
  onClearFilter?: () => void;
  openColumn: () => void;
}

const { Item } = Form;
function tagRender(props: any) {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      className="primary-bg"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
    >
      {label}
    </Tag>
  );
}

const ListStatus: Array<BaseBootstrapResponse> = [
  {
    value: "on_hand",
    name: "Tồn trong kho",
  },
  {
    value: "committed",
    name: "Đang giao dịch",
  },
  {
    value: "available",
    name: "Có thể bán",
  },
  {
    value: "in_coming",
    name: "Đang chờ nhập",
  },
  {
    value: "on_way",
    name: "Đang trên đường",
  },
  {
    value: "on_hold",
    name: "Đang tạm giữ",
  },
  {
    value: "defect",
    name: "Hàng lỗi",
  },
  {
    value: "transferring",
    name: "Hàng đang chuyển đến",
  },
  {
    name: "Hàng đang giao",
    value: "shipping"
  }
]

const AllInventoryFilter: React.FC<InventoryFilterProps> = (
  props: InventoryFilterProps
) => {
  const {
    params,
    actions,
    listStore,
    onMenuClick,
    // onClearFilter,
    onFilter,
  } = props;
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [formBaseFilter] = Form.useForm();
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  const onBaseFinish = useCallback(
    (values: InventoryQuery) => {
      let data = formBaseFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formBaseFilter, onFilter]
  );
  useEffect(() => {
    formBaseFilter.setFieldsValue({ ...advanceFilters });
  }, [advanceFilters, formBaseFilter]);
  useEffect(() => {
    setAdvanceFilters({ ...params });
  }, [params]);
  return (
    <div className="inventory-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form
          onFinish={onBaseFinish}
          initialValues={advanceFilters}
          form={formBaseFilter}
          name={"baseInventory"}
          layout="inline"
        >
          <Item name={InventoryQueryField.condition} className="search">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: "100%" }}
              placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
            />
          </Item>
          <Item name={InventoryQueryField.store_ids} className="store">
            <CustomSelect
              showSearch
              optionFilterProp="children"
              showArrow
              placeholder="Chọn cửa hàng"
              mode="multiple"
              allowClear
              tagRender={tagRender}
              style={{
                width: "100%",
              }}
              notFoundContent="Không tìm thấy kết quả"
              maxTagCount="responsive"
            >
              {listStore?.map((item) => (
                <CustomSelect.Option key={item.id} value={item.id}>
                  {item.name}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          </Item>
          <Item name={InventoryQueryField.status} className="store">
            <CustomSelect
              showSearch
              optionFilterProp="children"
              showArrow
              placeholder="Chọn trạng thái"
              allowClear
              tagRender={tagRender}
              style={{
                width: "100%",
              }}
              notFoundContent="Không tìm thấy kết quả"
            >
              {ListStatus?.map((item) => (
                <CustomSelect.Option key={item.value} value={item.value}>
                  {item.name}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          </Item>
          <Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Item>
        </Form>
      </CustomFilter>
    </div>
  );
};
export default AllInventoryFilter;
