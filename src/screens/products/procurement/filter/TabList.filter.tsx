import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import AccountSearchSelect from "component/custom/select-search/account-select";
import BaseFilter from "component/filter/base.filter";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import ButtonSetting from "component/table/ButtonSetting";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { StoreResponse } from "model/core/store.model";
import { SupplierResponse } from "model/core/supplier.model";
import { ProcurementQuery } from "model/purchase-order/purchase-procument";
import querystring from "querystring";
import React, { createRef, Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import { FilterProcurementStyle, ProcurementStatusStyle } from "./styles";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { DATE_FORMAT, formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import { isArray } from "lodash";
const { Item } = Form;
const BaseProcumentField = {
  content: "content",
  merchandisers: "merchandisers",
  suppliers: "suppliers"
};

interface ProcurementFilter {
  active_from: string;
  active_to: string;
  stock_in_from: string;
  stock_in_to: string;
  expect_receipt_from: string;
  expect_receipt_to: string;
  stockUser: string;
  confirmUser: string;
  status: string;
  cancelDate: string;
  merchandisers: string;
  stores: string;
  suppliers: string;
}

const SearchProcurementField = {
  active_from: 'active_from',
  active_to: 'active_to',
  stock_in_from: 'stock_in_from',
  stock_in_to: 'stock_in_to',
  expect_receipt_from: 'expect_receipt_from',
  expect_receipt_to: 'expect_receipt_to'
};

interface ProcurementFilterProps{
  onClickOpen?: () => void;
  paramsUrl?: any;
}

const ProcurementFilterItem = {
  stockDate: "active",
  confirmDate: "stock_in",
  expectDate: "expect_receipt",
  status: "status",
  stores: "stores",
};

const ProcurementFilterName = {
  [ProcurementFilterItem.stockDate]: "Ngày duyệt phiếu nhập",
  [ProcurementFilterItem.confirmDate]: "Ngày nhập kho",
  [ProcurementFilterItem.status]: "Trạng thái phiếu nhập kho",
  [ProcurementFilterItem.stores]: "Kho nhận hàng",
  [ProcurementFilterItem.expectDate]: "Ngày nhận dự kiến",
};

const keysDateFilter = [ProcurementFilterItem.stockDate, ProcurementFilterItem.confirmDate, ProcurementFilterItem.expectDate]

function TabListFilter(props: ProcurementFilterProps) {
  const {
    onClickOpen,
    paramsUrl,
  } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>()
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const [visible, setVisible] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateClick, setDateClick] = useState('');
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [allStore, setAllStore] = useState<Array<StoreResponse>>();

  const [formBase] = useForm();
  const [formAdvanced] = useForm();

  const openVisibleFilter = () => {
    setVisible(true);
  };
  const cancelFilter = () => {
    setVisible(false);
  };

  const resetFilter = useCallback(() => {
    let fields = formAdvanced.getFieldsValue(true);
    for (let key in fields) {
      if(fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formAdvanced.resetFields();
    formAdvanced.submit();
    setVisible(false);
  }, [formAdvanced]);

  const onAdvanceFinish = useCallback(
    (data: ProcurementFilter) => {
      setVisible(false);
      const params: ProcurementQuery = parseDataToString(data);

      const formBaseData = formBase.getFieldsValue(true);
      const newFormBaseData = { ...formBaseData };
      newFormBaseData.merchandisers = formBaseData?.merchandisers?.toString();
      setAdvanceFilters(data);
      history.replace(
        `${UrlConfig.PROCUREMENT}?${querystring.stringify({
          ...params,
          ...newFormBaseData,
        })}`
      );
    },
    [formBase, history]
  );

  const resetField = useCallback(
    (field: string[]) => {
      if (field.length === 1) {
        formAdvanced.resetFields([field[0]]);
        if (field[0] === 'status') setSelectedStatuses([]);
      }

      formAdvanced.resetFields([field[0], field[1]]);

      onAdvanceFinish(field.length === 1 ? {
        ...advanceFilters,
        [field[0]]: undefined,
      } : {
        ...advanceFilters,
        [field[0]]: undefined,
        [field[1]]: undefined,
      });
    },
    [formAdvanced, onAdvanceFinish, advanceFilters]
  );

  const convertParams = (params: any) => {
    return {
      ...params,
      [SearchProcurementField.active_from]: formatDateFilter(params[SearchProcurementField.active_from])?.format(DATE_FORMAT.DDMMYYY),
      [SearchProcurementField.active_to]: formatDateFilter(params[SearchProcurementField.active_to])?.format(DATE_FORMAT.DDMMYYY),
      [SearchProcurementField.stock_in_from]: formatDateFilter(params[SearchProcurementField.stock_in_from])?.format(DATE_FORMAT.DDMMYYY),
      [SearchProcurementField.stock_in_to]: formatDateFilter(params[SearchProcurementField.stock_in_to])?.format(DATE_FORMAT.DDMMYYY),
      [SearchProcurementField.expect_receipt_from]: formatDateFilter(params[SearchProcurementField.expect_receipt_from])?.format(DATE_FORMAT.DDMMYYY),
      [SearchProcurementField.expect_receipt_to]: formatDateFilter(params[SearchProcurementField.expect_receipt_to])?.format(DATE_FORMAT.DDMMYYY),
      [ProcurementFilterItem.stores]: params.stores ? params.stores?.split(',').map((x: string) => parseInt(x)) : undefined,
    };
  }

  const handleClickStatus = useCallback((value: string) => {
    let statusList = formAdvanced.getFieldValue('status') || [];

    if (!isArray(statusList)) {
      statusList = statusList.split(',');
    }

    if (statusList && !statusList.includes(value)) {
      statusList.push(value);
    } else if (statusList && statusList.includes(value)) {
      const index = statusList.indexOf(value);
      if (index > -1) {
        statusList.splice(index, 1);
      }
    } else {
      statusList.push(value);
    }

    formAdvanced.setFieldsValue({
      ...formAdvanced.getFieldsValue(),
      status: statusList
    });

    setSelectedStatuses([...statusList]);
  }, [formAdvanced]);

  useEffect(() => {
    const filters = convertParams(paramsUrl);

    setAdvanceFilters(filters);
    formAdvanced.setFieldsValue(filters);
    handleClickStatus(paramsUrl.status);
  }, [formAdvanced, handleClickStatus, paramsUrl]);

  const parseDataToString = (data: ProcurementFilter) => {
    const params: ProcurementQuery = {} as ProcurementQuery;
    const { active_from, active_to, stock_in_from, stock_in_to, expect_receipt_from, expect_receipt_to } = data;

    //ngay duyet
    if (active_from) params.active_from = getStartOfDayCommon(active_from)?.format();
    if (active_to ) params.active_to = getEndOfDayCommon(active_to)?.format();

    //ngay xac nhan phieu
    if (stock_in_from) params.stock_in_from = getStartOfDayCommon(stock_in_from)?.format();
    if (stock_in_to) params.stock_in_to = getEndOfDayCommon(stock_in_to)?.format();

    // ngay nhan du kien
    if (expect_receipt_from) params.expect_receipt_from = getStartOfDayCommon(expect_receipt_from)?.format();
    if (expect_receipt_to) params.expect_receipt_to = getEndOfDayCommon(expect_receipt_to)?.format();

    //trang thai
    if (data.status) {
      params.status = data.status.toString();
    }

    //cua hang
    if (data?.stores) {
      params.stores = data.stores.toString();
    }

    if (data?.suppliers) {
      params.suppliers = data.suppliers.toString();
    }

    return params;
  };

  const onBaseFinish = (data: any) => {
    data.merchandisers = data?.merchandisers?.toString();

    const formAdvanceData = formAdvanced.getFieldsValue(true);
    const formAdvanceParams: ProcurementQuery = parseDataToString(formAdvanceData);

    history.push(
      `${UrlConfig.PROCUREMENT}?${querystring.stringify({
        ...data,
        ...formAdvanceParams,
      })}`
    );
  };

  useEffect(() => {
    dispatch(
      SupplierGetAllAction((stores) => {
        setAllSupplier(stores);
      })
    );

    dispatch(
      getListStoresSimpleAction((stores) => {
        setAllStore(stores);
      })
    );
  }, [dispatch]);

  return (
    <Form.Provider>
      <Form onFinish={onBaseFinish} form={formBase} layout="inline">
        <FilterProcurementStyle>
          <Item name={BaseProcumentField.content} className="search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo ID phiếu nhập kho, mã đơn đặt hàng"
            />
          </Item>
          <Item className="suppliers">
            <SupplierSearchSelect
                  label=""
                  name={BaseProcumentField.suppliers}
                  mode="multiple"
                  help={false}
                  maxTagCount="responsive"
              />
          </Item>
          <Item className="merchandisers">
            <AccountSearchSelect
                label=""
                placeholder="Chọn merchandisers"
                name={BaseProcumentField.merchandisers}
                mode="multiple"
                queryAccount={{department_ids: [AppConfig.WIN_DEPARTMENT]}}
                help={false}
                maxTagCount="responsive"
              />
          </Item>
          <div className="btn-action">
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>

            <Item>
              <Button icon={<FilterOutlined />} onClick={openVisibleFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
            <Item><ButtonSetting onClick={onClickOpen} /></Item>
          </div>
        </FilterProcurementStyle>
      </Form>

      {advanceFilters && (
        <FilterList
          filters={advanceFilters}
          resetField={resetField}
          allSupplier={allSupplier}
          stores={allStore}
        />
      )}
      <BaseFilter
        onClearFilter={resetFilter}
        onFilter={() => {
          formAdvanced.submit();
        }}
        onCancel={cancelFilter}
        visible={visible}
        width={700}
      >
        <Form ref={formRef} onFinish={onAdvanceFinish} form={formAdvanced}>
          <Row gutter={20}>
            {Object.values(ProcurementFilterItem).map((field) => {
              let component: any = null;
              switch (field) {
                case ProcurementFilterItem.stockDate:
                case ProcurementFilterItem.confirmDate:
                case ProcurementFilterItem.expectDate:
                  component = <CustomFilterDatePicker
                    fieldNameFrom={`${field}_from`}
                    fieldNameTo={`${field}_to`}
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />;
                  break;
                case ProcurementFilterItem.stores:
                  component = <TreeStore name={field} form={formAdvanced} listStore={allStore}/>;
                  break;
                case ProcurementFilterItem.status:
                  component = (
                    <ProcurementStatusStyle>
                      {Object.keys(ProcurementStatus).map((item) => (
                        <Button
                          key={item}
                          value={item}
                          onClick={() => handleClickStatus(item)}
                          className={
                            selectedStatuses.includes(item) ? "active" : ""
                          }
                        >
                          {ProcurementStatusName[item]}
                        </Button>
                      ))}
                    </ProcurementStatusStyle>
                  );
                  break;
              }
              return (
                <Col span={12} key={field}>
                  <div className="font-weight-500">{ProcurementFilterName[field]}</div>
                  <Item name={field}>{component}</Item>
                </Col>
              );
            })}
          </Row>
        </Form>
      </BaseFilter>
    </Form.Provider>
  );
}
type FilterListProps = {
  filters: any;
  resetField: (field: string[]) => void;
  allSupplier: Array<SupplierResponse> | undefined;
  stores: Array<StoreResponse> | undefined;
};
const FilterList = ({ filters, resetField, stores }: FilterListProps) => {
  const newFilters = {...filters};
  let filtersKeys = Object.keys(newFilters);
  let renderTxt: any = null;
  const newKeys = ConvertDatesLabel(newFilters, keysDateFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateFilter, i));

  const getStoreName = (storeId: number) => {
    if (!stores) return '';

    if (stores?.length > 0) {
      const storesFiltered = stores?.filter((i) => i.id === Number(storeId));
      return storesFiltered[0].name
    }

    return '';
  };

  return (
    <div>
      {[...newKeys, ...filtersKeys].map((filterKey, index) => {
        let value = filters[filterKey];

        if (!ProcurementFilterName[filterKey]) return <Fragment />;

        switch (filterKey) {
          case ProcurementFilterItem.stockDate:
          case ProcurementFilterItem.confirmDate:
          case ProcurementFilterItem.expectDate:
            renderTxt = `${ProcurementFilterName[filterKey]} 
            : ${filters[`${filterKey}_from`] ? filters[`${filterKey}_from`] : '??'} 
            ~ ${filters[`${filterKey}_to`] ? filters[`${filterKey}_to`] : '??'}`
            break;
          case ProcurementFilterItem.stores:
            if (!value) return null;
            const newValuesStore = Array.isArray(value) ? value : value.split(',');

            renderTxt = `${ProcurementFilterName[filterKey]} : `;
            newValuesStore.forEach((i: number, index: number) => {
              renderTxt = renderTxt + `${getStoreName(i)}${newValuesStore.length - 1 === index ? '' : ', '}`
            });
            break;
          case ProcurementFilterItem.status:
            if (!value || value === '') return null;
            let newValuesStatus = Array.isArray(value) ? value : value.split(',');

            newValuesStatus = newValuesStatus.filter((e: any) => e !== '');
            renderTxt = `${ProcurementFilterName[filterKey]} : `;
            newValuesStatus.forEach((i: string, index: number) => {
              renderTxt = renderTxt + `${ProcurementStatusName[i]}${newValuesStatus.length - 1 === index ? '' : ', '}`
            });
        }

        return (
          <Tag
            onClose={() => {
              if (keysDateFilter.indexOf(filterKey) !== -1) {
                resetField([`${filterKey}_from`, `${filterKey}_to`]);
                return;
              }
              resetField([filterKey]);
            }}
            key={index}
            className="fade margin-bottom-20"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </div>
  );
};
export default TabListFilter;
