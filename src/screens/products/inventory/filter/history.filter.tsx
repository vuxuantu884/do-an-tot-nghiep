import {FilterOutlined} from "@ant-design/icons";
import {Button, Col, Collapse, Form, FormInstance, Input, Row, Space, Tag} from "antd";
import search from "assets/img/search.svg";
import {FilterWrapper} from "component/container/filter.container";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import BaseFilter from "component/filter/base.filter";
import {
  StyledButton,
} from "component/filter/component/range-picker.custom";
import {MenuAction} from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import {StoreResponse} from "model/core/store.model";
import {InventoryQuery, HistoryInventoryQuery} from "model/inventory";
import {
  AvdHistoryInventoryFilter,
  HistoryInventoryMappingField,
  HistoryInventoryQueryField,
} from "model/inventory/field";
import moment from "moment";
import {createRef, useCallback, useEffect, useState} from "react";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import {DATE_FORMAT, formatDateFilter, getEndOfDayCommon, getStartOfDayCommon} from "utils/DateUtils";
import {QuantityButtonStyle} from "./history-filter.style";
import TreeStore from "./TreeStore";

interface HistoryInventoryFilterProps {
  params: HistoryInventoryQuery;
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
  const [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [dateClick, setDateClick] = useState('');
  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onBaseFinish = useCallback(
    (values: HistoryInventoryQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onAdvanceFinish = useCallback(
    (values: any) => {
      let data = {
        ...formAdvanceFilter.getFieldsValue(true),
        ...values
      };

      if (data.from_transaction_date)
        data.from_transaction_date = getStartOfDayCommon(values.from_transaction_date)?.format();

      if (data.to_transaction_date)
        data.to_transaction_date = getEndOfDayCommon(values.to_transaction_date)?.format();

      if (data.to_quantity===1)
          data.to_quantity = '0'
      if (data.from_quantity===1)
          data.from_quantity = '0'

      setAdvanceFilters(data);

      onFilter && onFilter(data);
    },
    [onFilter, formAdvanceFilter]
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
      formAdvanceFilter.resetFields([field]);
      formBaseFilter.resetFields([field]);
      formAdvanceFilter.submit();
    },
    [formBaseFilter, formAdvanceFilter]
  );


  useEffect(() => {
    const { from_quantity,from_transaction_date, to_transaction_date, to_quantity} = params;
    const filter = {
      ...params,
      [HistoryInventoryQueryField.from_transaction_date]: formatDateFilter(from_transaction_date),
      [HistoryInventoryQueryField.to_transaction_date]: formatDateFilter(to_transaction_date),
      [HistoryInventoryQueryField.from_quantity]: from_quantity ? Number(from_quantity) : null,
      [HistoryInventoryQueryField.to_quantity]: to_quantity ? Number(to_quantity) : null,
    };

    formAdvanceFilter.setFieldsValue(filter);
    setAdvanceFilters(filter);
  }, [formAdvanceFilter, params]);

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
          initialValues={params}
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
            form={formAdvanceFilter}
            ref={formRef}
            layout="vertical"
          >
            {Object.keys(HistoryInventoryMappingField).filter(e=>e !== "quantity").map((field) => {
                  let component: any = null;
                  switch (field) {
                    case AvdHistoryInventoryFilter.transaction_date:
                      component = <CustomFilterDatePicker
                        fieldNameFrom={HistoryInventoryQueryField.from_transaction_date}
                        fieldNameTo={HistoryInventoryQueryField.to_transaction_date}
                        activeButton={dateClick}
                        setActiveButton={setDateClick}
                        formRef={formRef}
                      />;
                      break;
                    case AvdHistoryInventoryFilter.quantity_change:
                      component = <QuantityChange form={formAdvanceFilter} />;
                      break;
                    }
                  return (
                    <Row>
                      <Col span={24} key={field}>
                        <div className="font-weight-500">{HistoryInventoryMappingField[field]}</div>
                        <Item name={field}>{component}</Item>
                      </Col>
                    </Row>
                  );
                })}
          </Form>
        </BaseFilter>
      </Form.Provider>
    </div>
  );
};

const keysDateFilter = ['transaction_date', 'quantity'];

const FilterList = ({filters,resetField}: any) => {
  const newFilters = {...filters};
  let filtersKeys = Object.keys(filters);
  let renderTxt: any = null;
  const newKeys = ConvertDatesLabel(newFilters, keysDateFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateFilter, i));
  return (
    <div>
      {[...newKeys, ...filtersKeys].map((filterKey) => {
        let value = filters[filterKey];

        if ((value === null || value === undefined)
          && (filters[`from_${filterKey}`] === undefined || filters[`from_${filterKey}`] === null)
          && (filters[`to_${filterKey}`] === undefined || filters[`to_${filterKey}`]) === null) return null;
        if (!HistoryInventoryMappingField[filterKey]) return null;

        switch (filterKey) {
          case AvdHistoryInventoryFilter.transaction_date:
             renderTxt = `${HistoryInventoryMappingField.transaction_date} 
            : ${filters[`from_${filterKey}`] ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'} 
            ~ ${filters[`to_${filterKey}`] ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'}`
            break;
         case 'quantity':
            renderTxt =
              `${HistoryInventoryMappingField[AvdHistoryInventoryFilter.quantity_change]}: 
              ${filters[HistoryInventoryQueryField.to_quantity] === 0 ? `Trừ`: `Cộng`}`;
            break;
        }
        return (
          <Tag
            onClose={() => {
              if (filterKey === AvdHistoryInventoryFilter.transaction_date) {
                resetField(HistoryInventoryQueryField.from_transaction_date);
                resetField(HistoryInventoryQueryField.to_transaction_date);
                return;
              }
              if (filterKey === "quantity") {
                resetField(HistoryInventoryQueryField.from_quantity);
                resetField(HistoryInventoryQueryField.to_quantity);
                return;
              }
              resetField(filterKey)
            }
              }
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
          form.setFieldsValue({[HistoryInventoryQueryField.to_quantity]: 1});
          form.setFieldsValue({[HistoryInventoryQueryField.from_quantity]: null});
        }}
      >
        Trừ <br /> (Xuất hàng)
      </StyledButton>
      <StyledButton
        className={"btn-item"}
        onClick={() => {
          form.setFieldsValue({[HistoryInventoryQueryField.to_quantity]: null});
          form.setFieldsValue({[HistoryInventoryQueryField.from_quantity]: 1});
        }}
      >
        Cộng <br /> (Nhập hàng)
      </StyledButton>
    </QuantityButtonStyle>
  );
};
export default HistoryInventoryFilter;
