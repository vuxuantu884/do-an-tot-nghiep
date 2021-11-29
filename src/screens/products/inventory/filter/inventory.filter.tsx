import {FilterOutlined} from "@ant-design/icons";
import {Button, Collapse, Form, Input, Space, Tag} from "antd";
import search from "assets/img/search.svg";
import {FilterWrapper} from "component/container/filter.container";
import CustomSelect from "component/custom/select.custom";
import BaseFilter from "component/filter/base.filter";
import NumberInputRange from "component/filter/component/number-input-range";
import CustomRangepicker from "component/filter/component/range-picker.custom";
import {MenuAction} from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import {StoreResponse} from "model/core/store.model";
import {InventoryQuery} from "model/inventory";
import {
  AvdInventoryFilter,
  InventoryMappingField,
  InventoryQueryField,
} from "model/inventory/field";
import moment from "moment";
import React, {useCallback, useEffect, useState} from "react";
import {checkFixedDate, DATE_FORMAT} from "utils/DateUtils";

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

const {Item} = Form;
const {Panel} = Collapse;

function tagRender(props: any) {
  const {label, closable, onClose} = props;
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

const InventoryFilter: React.FC<InventoryFilterProps> = (props: InventoryFilterProps) => {
  const {params, listStore, onFilter, isMulti, openColumn, id} = props;
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
    formBaseFilter.setFieldsValue({...advanceFilters});
    formAdvanceFilter.setFieldsValue({...advanceFilters});
    setTempAdvanceFilters(advanceFilters);
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);
  const resetField = useCallback(
    (field: string) => {
      formBaseFilter.setFieldsValue({
        ...formBaseFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formAdvanceFilter.setFieldsValue({
        ...formAdvanceFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formBaseFilter.submit();
    },
    [formBaseFilter, formAdvanceFilter]
  );

  useEffect(() => {
    setAdvanceFilters({...params});
  }, [params]);
  return (
    <div className="inventory-filter">
      <Form.Provider
        onFormFinish={(name, {values, forms}) => {
          let baseValues = formBaseFilter.getFieldsValue(true);
          let advanceValues = formAdvanceFilter?.getFieldsValue(true);
          let data = {
            ...baseValues,
            ...advanceValues, 
            condition: baseValues.condition, 
          };
          let transaction_date = data[InventoryQueryField.transaction_date],
            total_stock = data[InventoryQueryField.total_stock],
            on_hand = data[InventoryQueryField.on_hand],
            committed = data[InventoryQueryField.committed],
            available = data[InventoryQueryField.available],
            on_hold = data[InventoryQueryField.on_hold],
            defect = data[InventoryQueryField.defect],
            incoming = data[InventoryQueryField.incoming],
            transferring = data[InventoryQueryField.transferring],
            on_way = data[InventoryQueryField.on_way],
            shipping = data[InventoryQueryField.shipping],
            mac = data[InventoryQueryField.mac],
            import_price = data[InventoryQueryField.import_price],
            retail_price = data[InventoryQueryField.retail_price];

          const [from_transaction_date, to_transaction_date] = transaction_date
              ? transaction_date
              : [undefined, undefined],
            [from_total_stock, to_total_stock] = total_stock
              ? total_stock
              : [undefined, undefined],
            [from_on_hand, to_on_hand] = on_hand ? on_hand : [undefined, undefined],
            [from_committed, to_committed] = committed
              ? committed
              : [undefined, undefined],
            [from_available, to_available] = available
              ? available
              : [undefined, undefined],
            [from_on_hold, to_on_hold] = on_hold ? on_hold : [undefined, undefined],
            [from_defect, to_defect] = defect ? defect : [undefined, undefined],
            [from_incoming, to_incoming] = incoming ? incoming : [undefined, undefined],
            [from_transferring, to_transferring] = transferring
              ? transferring
              : [undefined, undefined],
            [from_on_way, to_on_way] = on_way ? on_way : [undefined, undefined],
            [from_shipping, to_shipping] = shipping ? shipping : [undefined, undefined],
            [from_mac, to_mac] = mac ? mac : [undefined, undefined],
            [from_import_price, to_import_price] = import_price
              ? import_price
              : [undefined, undefined],
            [from_retail_price, to_retail_price] = retail_price
              ? retail_price
              : [undefined, undefined];
          for (let key in data) {
            if (data[key] instanceof Array) {
              if (data[key].length === 0) data[key] = undefined;
            }
          }
          data = {
            ...data,
            from_transaction_date,
            to_transaction_date,
            from_total_stock,
            to_total_stock,
            from_on_hand,
            to_on_hand,
            from_committed,
            to_committed,
            from_available,
            to_available,
            from_on_hold,
            to_on_hold,
            from_defect,
            to_defect,
            from_incoming,
            to_incoming,
            from_transferring,
            to_transferring,
            from_on_way,
            to_on_way,
            from_shipping,
            to_shipping,
            from_mac,
            to_mac,
            from_import_price,
            to_import_price,
            from_retail_price,
            to_retail_price, 
          };
          formBaseFilter.setFieldsValue({...data});
          formAdvanceFilter?.setFieldsValue({
            ...data,
          });
        }}
      >
        <Form
          onFinish={onBaseFinish}
          initialValues={advanceFilters}
          form={formBaseFilter}
          name={`baseInventory_${id}`}
          layout="inline"
        >
          <FilterWrapper>
            <Item name={InventoryQueryField.condition} className="search">
              <Input
                prefix={<img src={search} alt="" />}
                style={{width: "100%"}}
                placeholder="Tìm kiếm sản phẩm theo SKU"
              />
            </Item>
            <Item name={InventoryQueryField.store_ids} className="store_ids">
              <CustomSelect
                showSearch
                optionFilterProp="children"
                showArrow
                placeholder="Chọn cửa hàng"
                mode={isMulti ? "multiple" : undefined}
                allowClear
                tagRender={tagRender}
                style={{
                  width: 150,
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
          </FilterWrapper>
        </Form>
        <FilterList filters={advanceFilters} resetField={resetField} />
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
            initialValues={{}}
            form={formAdvanceFilter}
          >
            <Space className="po-filter" direction="vertical" style={{width: "100%"}}>
              {Object.keys(AvdInventoryFilter).map((field) => {
                let component: any = null;
                switch (field) {
                  case AvdInventoryFilter.transaction_date:
                    component = <CustomRangepicker />;
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
                }
                return (
                  <Collapse key={field}>
                    <Panel
                      key="1"
                      className={tempAdvanceFilters[field] ? "active" : ""}
                      header={<span>{InventoryMappingField[field]?.toUpperCase()}</span>}
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

const FilterList = ({filters, resetField}: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <div>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return null;
        if (!InventoryMappingField[filterKey]) return null;
        switch (filterKey) {
          case AvdInventoryFilter.transaction_date:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${InventoryMappingField[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${InventoryMappingField[filterKey]} : ${formatedFrom} - ${formatedTo}`;
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
            let [from1, to1] = value;
            let fromS = "";
            let toS = "";
            if (from1 === undefined || from1 === null) {
              fromS = "~";
            } else {
              fromS = from1;
            }
            if (to1 === undefined || to1 === null) {
              toS = "~";
            } else {
              toS = to1;
            }
            renderTxt = `${InventoryMappingField[filterKey]} : ${fromS} - ${toS}`;
            break;
        }
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
            style={{marginBottom: "20px"}}
          >{`${renderTxt}`}</Tag>
        );
      })}
    </div>
  );
};

export default InventoryFilter;
