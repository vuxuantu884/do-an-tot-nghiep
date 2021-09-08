import { Button, Collapse, Form, Input, Space, Tag } from "antd";
import CustomSelect from "component/custom/select.custom";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { StoreResponse } from "model/core/store.model";
import { InventoryQuery } from "model/inventory";
import { AvdHistoryInventoryFilter, HistoryInventoryMappingField, HistoryInventoryQueryField } from "model/inventory/field";
import { useCallback, useEffect, useState } from "react";
import search from "assets/img/search.svg";
import { FilterOutlined } from "@ant-design/icons";
import BaseFilter from "component/filter/base.filter";
import CustomRangepicker from "component/filter/component/range-picker.custom";
import { checkFixedDate, DATE_FORMAT } from "utils/DateUtils";
import moment from "moment";

interface HistoryInventoryFilterProps {
  params: InventoryQuery;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: InventoryQuery) => void;
  onClearFilter?: () => void;
  openColumn: () => void;
}

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

const { Item } = Form;
const { Panel } = Collapse;

const HistoryInventoryFilter: React.FC<HistoryInventoryFilterProps> = (
  props: HistoryInventoryFilterProps
) => {
  const { params, actions, listStore, onMenuClick, onFilter, openColumn } =
    props;
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
    setAdvanceFilters({ ...params });
  }, [params]);
  useEffect(() => {
    formBaseFilter.setFieldsValue({ ...advanceFilters });
    formAdvanceFilter.setFieldsValue({ ...advanceFilters });
    setTempAdvanceFilters(advanceFilters);
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);
  return (
    <div className="inventory-filter">
      <Form.Provider>
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            onFinish={onBaseFinish}
            initialValues={advanceFilters}
            form={formBaseFilter}
            name={`baseHistory`}
            layout="inline"
          >
            <Item
              name={HistoryInventoryQueryField.condition}
              className="search"
            >
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: "100%" }}
                placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
              />
            </Item>
            <Item name={HistoryInventoryQueryField.store_id} className="store">
              <CustomSelect
                showSearch
                optionFilterProp="children"
                showArrow
                placeholder="Chọn cửa hàng"
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
        <FilterList filters={advanceFilters} resetField={resetField} />
        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
        >
          <Form
            name={`avdHistoryInventory`}
            onFinish={onAdvanceFinish}
            initialValues={{}}
            form={formAdvanceFilter}
          >
            <Space
              className="po-filter"
              direction="vertical"
              style={{ width: "100%" }}
            >
              {Object.keys(AvdHistoryInventoryFilter).map((field) => {
                let component: any = null;
                switch (field) {
                  case AvdHistoryInventoryFilter.created_date:
                  case AvdHistoryInventoryFilter.transaction_date:
                    component = <CustomRangepicker />;
                    break;
                }
                return (
                  <Collapse key={field}>
                    <Panel
                      key="1"
                      className={tempAdvanceFilters[field] ? "active" : ""}
                      header={
                        <span>
                          {HistoryInventoryMappingField[field]?.toUpperCase()}
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

const FilterList = ({ filters, resetField }: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return null;
        if (!HistoryInventoryMappingField[filterKey]) return null;
        switch (filterKey) {
          case AvdHistoryInventoryFilter.created_date:
          case AvdHistoryInventoryFilter.transaction_date:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${HistoryInventoryMappingField[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${HistoryInventoryMappingField[filterKey]} : ${formatedFrom} - ${formatedTo}`;
            break;
        }
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </Space>
  );
};

export default HistoryInventoryFilter;
