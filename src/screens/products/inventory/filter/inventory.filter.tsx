import { Button, Collapse, Form, Input, Space, Tag } from "antd";
import CustomSelect from "component/custom/select.custom";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { StoreResponse } from "model/core/store.model";
import { InventoryQuery } from "model/inventory";
import React, { useCallback, useEffect, useState } from "react";
import search from "assets/img/search.svg";
import { FilterOutlined } from "@ant-design/icons";
import BaseFilter from "component/filter/base.filter";
import {
  AvdInventoryFilter,
  InventoryMappingField,
  InventoryQueryField,
} from "model/inventory/field";
import CustomRagpicker from "component/filter/component/range-picker.custom";
import NumberInputRange from "component/filter/component/number-input-range";
import ButtonSetting from "component/table/ButtonSetting";

export interface InventoryFilterProps {
  id: string;
  isMulti: boolean;
  params: InventoryQuery;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: InventoryQuery) => void;
  onClearFilter?: () => void;
  openColumn: () => void;
}

const { Item } = Form;
const { Panel } = Collapse;

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

const InventoryFilter: React.FC<InventoryFilterProps> = (
  props: InventoryFilterProps
) => {
  const {
    params,
    actions,
    listStore,
    onMenuClick,
    // onClearFilter,
    onFilter,
    isMulti,
    openColumn,
    id,
  } = props;
  const [visible, setVisible] = useState(false);
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [tempAdvanceFilters, setTempAdvanceFilters] = useState<any>({});
  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
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

  const onAdvanceFinish = useCallback(
    (values: InventoryQuery) => {
      let data = formAdvanceFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formAdvanceFilter, onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const onResetFilter = useCallback(() => {
    let fields = formAdvanceFilter.getFieldsValue(true);
    for (let key in fields) {
      fields[key] = null;
    }
    formAdvanceFilter.setFieldsValue(fields);
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  useEffect(() => {
    formBaseFilter.setFieldsValue({ ...advanceFilters });
    formAdvanceFilter.setFieldsValue({ ...advanceFilters });
    setTempAdvanceFilters(advanceFilters);
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);
  useEffect(() => {
    setAdvanceFilters({ ...params });
  }, [params]);
  return (
    <div className="inventory-filter">
      <Form.Provider>
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            onFinish={onBaseFinish}
            initialValues={advanceFilters}
            form={formBaseFilter}
            name={`baseInventory_${id}`}
            layout="inline"
          >
            <Item name={InventoryQueryField.condition} className="search">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: "100%" }}
                placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
              />
            </Item>
            <Item name={InventoryQueryField.store_id} className="store">
              <CustomSelect
                showSearch
                optionFilterProp="children"
                showArrow
                placeholder="Chọn cửa hàng"
                mode={isMulti ? "multiple" : undefined}
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
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
            <Item>
              <ButtonSetting onClick={openColumn} />
            </Item>
          </Form>
        </CustomFilter>
        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
        >
          <Form
            name={`avdInventory_${id}`}
            onFinish={onAdvanceFinish}
            form={formAdvanceFilter}
            onFieldsChange={(changedFields: any, allFields: any) => {
              let fieldNames =
                changedFields &&
                changedFields.length > 0 &&
                changedFields[0].name;
              if (!fieldNames) return;
              let filtersSelected: any = {};
              fieldNames.forEach((fieldName: any) => {
                filtersSelected[fieldName] = true;
              });
              setTempAdvanceFilters({
                ...filtersSelected,
                ...tempAdvanceFilters,
              });
            }}
          >
            <Space
              className="po-filter"
              direction="vertical"
              style={{ width: "100%" }}
            >
              {Object.keys(AvdInventoryFilter).map((field) => {
                let component: any = null;
                switch (field) {
                  case AvdInventoryFilter.created_date:
                  case AvdInventoryFilter.transaction_date:
                    component = <CustomRagpicker />;
                    break;
                  case AvdInventoryFilter.total_stock:
                  case AvdInventoryFilter.on_hand:
                  case AvdInventoryFilter.committed:
                  case AvdInventoryFilter.available:
                  case AvdInventoryFilter.on_hold:
                  case AvdInventoryFilter.defect:
                  case AvdInventoryFilter.incoming:
                  case AvdInventoryFilter.transferring:
                  case AvdInventoryFilter.on_way:
                  case AvdInventoryFilter.shipping:
                    component = <NumberInputRange />;
                    break;
                  case AvdInventoryFilter.import_price:
                  case AvdInventoryFilter.mac:
                  case AvdInventoryFilter.retail_price:
                    component = <NumberInputRange placeholderFrom="Giá từ" />;
                }
                return (
                  <Collapse key={field}>
                    <Panel
                      key="1"
                      className={tempAdvanceFilters[field] ? "active" : ""}
                      header={
                        <span>
                          {InventoryMappingField[field]?.toUpperCase()}
                        </span>
                      }
                    >
                      <Item name={field}>{component}</Item>
                    </Panel>
                  </Collapse>
                );
              })}
            </Space>
          </Form>
        </BaseFilter>
      </Form.Provider>
    </div>
  );
};

export default InventoryFilter;
