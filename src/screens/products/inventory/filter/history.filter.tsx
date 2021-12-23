import {FilterOutlined} from "@ant-design/icons";
import {Button, Collapse, Form, FormInstance, Input, Space, Tag} from "antd";
import search from "assets/img/search.svg";
import {FilterWrapper} from "component/container/filter.container";
import BaseFilter from "component/filter/base.filter";
import CustomRangepicker, {
  StyledButton,
} from "component/filter/component/range-picker.custom";
import {MenuAction} from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import {StoreResponse} from "model/core/store.model";
import {InventoryQuery} from "model/inventory";
import {
  AvdHistoryInventoryFilter,
  HistoryInventoryMappingField,
  HistoryInventoryQueryField,
} from "model/inventory/field";
import moment from "moment";
import {useCallback, useEffect, useState} from "react";
import {checkFixedDate, DATE_FORMAT} from "utils/DateUtils";
import {QuantityButtonStyle} from "./history-filter.style";
import TreeStore from "./TreeStore";

interface HistoryInventoryFilterProps {
  params: InventoryQuery;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: InventoryQuery) => void;
  onClearFilter?: () => void;
  openColumn: () => void;
  onChangeKeySearch: (value: string) => void;
}

const {Item} = Form;
const {Panel} = Collapse;

const HistoryInventoryFilter: React.FC<HistoryInventoryFilterProps> = (
  props: HistoryInventoryFilterProps
) => {
  const {params, listStore, onFilter, openColumn} = props;
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

  useEffect(() => {
    formBaseFilter.setFieldsValue({...advanceFilters});
    formAdvanceFilter.setFieldsValue({...advanceFilters});
    setTempAdvanceFilters(advanceFilters);
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);
  return (
    <div className="inventory-filter">
      <Form.Provider
        onFormFinish={(name, {values, forms}) => {
          let baseValues = formBaseFilter.getFieldsValue(true);
          let advanceValues = formAdvanceFilter?.getFieldsValue(true);
          let data = {
            ...baseValues,
            ...advanceValues,
            store_ids: baseValues.store_ids,
            condition: baseValues.condition,
          };
          let transaction_date = data[AvdHistoryInventoryFilter.transaction_date];

          const [from_transaction_date, to_transaction_date] = transaction_date
            ? transaction_date
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
            //quantity change
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
          name={`baseHistory`}
          layout="inline"
        >
          <FilterWrapper>
            <Item name={HistoryInventoryQueryField.condition} className="search">
              <Input
                prefix={<img src={search} alt="" />}
                style={{width: "100%"}}
                placeholder="Tìm kiếm sản phẩm theo SKU"
                onChange={(e)=>{props.onChangeKeySearch(e.target.value)}}
              />
            </Item>
            <Item 
              name={HistoryInventoryQueryField.store_ids} 
              className="store"
              style={{ minWidth: '220px'}}
            >
              <TreeStore 
                form={formBaseFilter} 
                name={HistoryInventoryQueryField.store_ids}
                placeholder="Chọn cửa hàng"
                listStore={listStore}
              />
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
            name={`avdHistoryInventory`}
            onFinish={onAdvanceFinish}
            initialValues={{}}
            form={formAdvanceFilter}
          >
            <Space className="po-filter" direction="vertical" style={{width: "100%"}}>
              {Object.keys(AvdHistoryInventoryFilter).map((field) => {
                return (
                  <Collapse key={field}>
                    <Panel
                      key="1"
                      className={tempAdvanceFilters[field] ? "active" : ""}
                      header={
                        <span>{HistoryInventoryMappingField[field]?.toUpperCase()}</span>
                      }
                    >
                      <Item name={field}>
                        {field === AvdHistoryInventoryFilter.transaction_date ? (
                          <CustomRangepicker />
                        ) : (
                          <QuantityChange form={formAdvanceFilter} />
                        )}
                      </Item>
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
        
        if (!value && filterKey === AvdHistoryInventoryFilter.transaction_date) return null;
        
        if (!HistoryInventoryMappingField[filterKey] && (['to_quantity','from_quantity'].indexOf(filterKey) === -1) ) 
          return null;
        
        switch (filterKey) {
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
          case HistoryInventoryQueryField.to_quantity:
            if (value === null) {
              return null;
            }
            renderTxt = `${HistoryInventoryMappingField[AvdHistoryInventoryFilter.quantity_change]}: Trừ`;
            break;
          case HistoryInventoryQueryField.from_quantity:
            if (value === null) {
              return null;
            }
            renderTxt = `${HistoryInventoryMappingField[AvdHistoryInventoryFilter.quantity_change]}: Cộng`;
            break;
        }
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
            style={{marginBottom: 20}}
          >{`${renderTxt}`}</Tag>
        );
      })}
    </div>
  );
};

type QuantityChangeProps = {
  form: FormInstance;
};
const QuantityChange = ({form}: QuantityChangeProps) => {
  return (
    <QuantityButtonStyle>
      <StyledButton
        className={"btn-item"}
        onClick={() => {
          form.setFieldsValue({[HistoryInventoryQueryField.to_quantity]: 0});
          form.setFieldsValue({[HistoryInventoryQueryField.from_quantity]: null});
        }}
      >
        Trừ <br /> (Xuất hàng)
      </StyledButton>
      <StyledButton
        className={"btn-item"}
        onClick={() => {
          form.setFieldsValue({[HistoryInventoryQueryField.to_quantity]: null});
          form.setFieldsValue({[HistoryInventoryQueryField.from_quantity]: 0});
        }}
      >
        Cộng <br /> (Nhập hàng)
      </StyledButton>
    </QuantityButtonStyle>
  );
};
export default HistoryInventoryFilter;
