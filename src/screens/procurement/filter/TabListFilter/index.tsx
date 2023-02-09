import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import ButtonSetting from "component/table/ButtonSetting";
import UrlConfig, { ProcurementTabUrl } from "config/url.config";
// import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { StoreResponse } from "model/core/store.model";
import { SupplierResponse } from "model/core/supplier.model";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import TreeStore from "component/CustomTreeSelect";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import { FilterProcurementStyleWrapper } from "../styles";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { splitDateRange } from "utils/DateUtils";
import BaseFilterResult from "component/base/BaseFilterResult";
import { useArray } from "hook/useArray";
import { formatFieldTag, generateQuery, transformParamsToObject } from "utils/AppUtils";
import {
  ProcurementFilterAdvanceEnum,
  ProcurementFilterAdvanceName,
  ProcurementFilterBasicEnum,
  ProcurementFilterBasicName,
  ProcurementFilterProps,
} from "component/filter/interfaces/procurement";
import isEqual from "lodash/isEqual";
import { isArray } from "lodash";
import CustomSelect from "component/custom/select.custom";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { useFetchMerchans } from "hook/useFetchMerchans";
import { supplierGetApi } from "service/core/supplier.service";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import { callApiNative } from "utils/ApiUtils";

const { Item } = Form;

type TabListFilterInjectedProps = {
  actions: Array<MenuAction>;
  onMenuClick: (index: number) => void;
  listStore: Array<StoreResponse>;
};

type ProcurementTabListFilterProps = TabListFilterInjectedProps & ProcurementFilterProps;

function TabListFilter(props: ProcurementTabListFilterProps) {
  const { onClickOpen, paramsUrl, accounts, actions, onMenuClick, listStore } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const [isVisible, setIsVisible] = useState(false);
  const [dateClick, setDateClick] = useState("");
  // const { array: selectedStatuses, set: setSelectedStatuses, remove: removeStatus } = useArray([])
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([]);

  const [formBase] = useForm();
  const [formAdvanced] = useForm();

  const openVisibleFilter = () => setIsVisible(true);
  const cancelFilter = () => setIsVisible(false);

  const resetFilter = () => {
    let fields = formAdvanced.getFieldsValue(true);
    for (let key in fields) {
      if (fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formAdvanced.resetFields();
    formAdvanced.submit();
    setIsVisible(false);
  };

  const onAdvanceFinish = async (data: any) => {
    setIsVisible(false);
    if (data.note) {
      data = {
        ...data,
        note: data.note.trim(),
      };
    }
    // setSelectedStatuses(formAdvanced.getFieldValue('status'))
    await history.replace(
      `${UrlConfig.PROCUREMENT}?${generateQuery({
        ...paramsUrl,
        ...data,
        page: 1,
      })}`,
    );
  };

  // const handleClickStatus = (value: string) => {
  //   const findSelected = selectedStatuses.find(status => status === value)
  //   if (!findSelected) {
  //     setSelectedStatuses([...selectedStatuses, value])
  //   } else {
  //     const findIndexSelected = selectedStatuses.findIndex(status => status === value)
  //     removeStatus(findIndexSelected)
  //   }
  // }

  const onRemoveStatus = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const convertParams = (params: any) => {
    return {
      ...params,
      // [ProcurementFilterAdvanceEnum.status]: params.status,
      // [ProcurementFilterAdvanceEnum.stores]: params.stores?.toString()?.split(',').map((x: string) => parseInt(x)),
    };
  };

  const onBaseFinish = (data: any) => {
    if (data.content) {
      data = {
        ...data,
        content: data.content.trim(),
      };
    }
    let queryParam = generateQuery({ ...paramsUrl, ...data, page: 1 });
    history.replace(`${UrlConfig.PROCUREMENT}?${queryParam}`);
  };

  const formatDateRange = (from: Date, to: Date) => {
    if (!from && !to) return;
    return `${from || "??"} ~ ${to || "??"}`;
  };

  useEffect(() => {
    dispatch(SupplierGetAllAction((suppliers) => setAllSupplier(suppliers)));
  }, [dispatch]);

  useEffect(() => {
    if (history.location.pathname !== ProcurementTabUrl.ALL) {
      return;
    }
    const newParams = {
      ...paramsUrl,
      active: formatDateRange(paramsUrl.active_from, paramsUrl.active_to),
      stock_in: formatDateRange(paramsUrl.stock_in_from, paramsUrl.stock_in_to),
      expect_receipt: formatDateRange(paramsUrl.expect_receipt_from, paramsUrl.expect_receipt_to),
    };
    // delete params date
    const {
      active_from,
      active_to,
      stock_in_from,
      stock_in_to,
      expect_receipt_from,
      expect_receipt_to,
      ...rest
    } = newParams;

    const formatted = formatFieldTag(rest, {
      ...ProcurementFilterAdvanceName,
      ...ProcurementFilterBasicName,
    });
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case ProcurementFilterBasicEnum.Suppliers:
          if (isArray(item.valueId)) {
            const filterSupplier = allSupplier?.filter((elem) =>
              item.valueId.find((id: number) => +elem.id === +id),
            );
            if (filterSupplier)
              return {
                ...item,
                valueName: filterSupplier?.map((item: any) => item.name).toString(),
              };
          }
          const findSupplier = allSupplier?.find((supplier) => +supplier.id === +item.valueId);
          return { ...item, valueName: findSupplier?.name };
        case ProcurementFilterBasicEnum.StoreIds:
          if (isArray(item.valueId)) {
            const filterStore = listStore?.filter((elem) =>
              item.valueId.find((id: number) => +elem.id === +id),
            );
            if (filterStore)
              return {
                ...item,
                valueName: filterStore?.map((item: any) => item.name).toString(),
              };
          }
          const findStore = listStore?.find((store) => +store.id === +item.valueId);
          return { ...item, valueName: findStore?.name };
        case ProcurementFilterBasicEnum.Status:
          let statuses: any = [];
          if (isArray(item.valueId)) {
            item.valueId.forEach((item: any) => {
              statuses.push(ProcurementStatusName[item]);
            });
          } else {
            statuses = ProcurementStatusName[item.valueId];
          }
          return { ...item, valueName: statuses?.toString() };
        case ProcurementFilterAdvanceEnum.StockInBys:
          if (isArray(item.valueId)) {
            const filterAccounts = accounts?.filter((elem) =>
              item.valueId.find((code: string) => elem.code === code),
            );
            if (filterAccounts)
              return {
                ...item,
                valueName: filterAccounts?.map(
                  (item: any, index: number) =>
                    `${item?.code} - ${item?.full_name}${
                      index === filterAccounts.length - 1 ? "" : ", "
                    }`,
                ),
              };
          }
          const findAccount = accounts?.find((account) => account.code === item.valueId);
          return {
            ...item,
            valueName: `${findAccount?.code} - ${findAccount?.full_name}`,
          };
        case ProcurementFilterAdvanceEnum.Merchandisers:
          if (isArray(item.valueId)) {
            const filterMerchandisers = merchans.items?.filter((elem) =>
              item.valueId.find((code: string) => elem.code === code),
            );
            if (filterMerchandisers)
              return {
                ...item,
                valueName: filterMerchandisers?.map(
                  (item: any, index: number) =>
                    `${item?.code} - ${item?.full_name}${
                      index === filterMerchandisers.length - 1 ? "" : ", "
                    }`,
                ),
              };
          }
          const findMerchandiser = merchans.items?.find((mer) => mer.code === item.valueId);
          return {
            ...item,
            valueName: `${findMerchandiser?.code} - ${findMerchandiser?.full_name}`,
          };
        case ProcurementFilterBasicEnum.Content:
        case ProcurementFilterAdvanceEnum.Active:
        case ProcurementFilterAdvanceEnum.StockIn:
        case ProcurementFilterAdvanceEnum.ExpectReceipt:
        case ProcurementFilterAdvanceEnum.Note:
          return { ...item, valueName: item.valueId.toString() };
        default:
          return item;
      }
    });
    setParamsArray(transformParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, JSON.stringify(listStore), JSON.stringify(allSupplier), accounts]);

  const removeDate = (params: any, key: string) => {
    const { start, end } = splitDateRange(params[key]);
    params[`${key}_from`] = start !== "??" ? start : undefined;
    params[`${key}_to`] = end !== "??" ? end : undefined;
  };

  //watch remove tag
  useEffect(() => {
    (async () => {
      if (history.location.pathname !== ProcurementTabUrl.ALL) {
        return;
      }
      if (paramsArray.length < (prevArray?.length || 0)) {
        // const filterStatusInParams = paramsArray.filter((item: any) => item.keyId === 'status').map((param: any) => param.status)
        // setSelectedStatuses(filterStatusInParams)
        let newParams = transformParamsToObject(paramsArray);
        if (newParams?.active) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.Active);
        }
        if (newParams?.stock_in) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.StockIn);
        }
        if (newParams?.expect_receipt) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.ExpectReceipt);
        }
        delete newParams[ProcurementFilterAdvanceEnum.Active];
        delete newParams[ProcurementFilterAdvanceEnum.StockIn];
        delete newParams[ProcurementFilterAdvanceEnum.ExpectReceipt];
        await history.push(`${history.location.pathname}?${generateQuery(newParams)}`);
      }
    })();
  }, [paramsArray, history, prevArray]);

  const getSupplierByCode = async (ids: string) => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, supplierGetApi, {
      ids,
    });
    if (res) setAllSupplier(res.items);
  };

  useEffect(() => {
    if (history.location.pathname !== ProcurementTabUrl.ALL) {
      return;
    }
    const filters = convertParams(paramsUrl);
    formBase.setFieldsValue({
      [ProcurementFilterBasicEnum.Suppliers]: paramsUrl.suppliers
        ?.toString()
        ?.split(",")
        .map((x: string) => parseInt(x)),
      [ProcurementFilterBasicEnum.Content]: paramsUrl.content,
      [ProcurementFilterBasicEnum.Status]: paramsUrl.status,
      [ProcurementFilterBasicEnum.StoreIds]: paramsUrl.stores
        ?.toString()
        ?.split(",")
        .map((x: string) => parseInt(x)),
    });
    formAdvanced.setFieldsValue({
      ...filters,
      // status: filters.status,
      active_from: filters.active_from,
      active_to: filters.active_to,
      stock_in_from: filters.stock_in_from,
      stock_in_to: filters.stock_in_to,
      expect_receipt_from: filters.expect_receipt_from,
      expect_receipt_to: filters.expect_receipt_to,
      merchandisers: filters.merchandisers,
      stock_in_bys: filters.stock_in_bys,
      note: filters.note,
    });
    if (paramsUrl.suppliers) {
      getSupplierByCode(paramsUrl.suppliers).then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAdvanced, paramsUrl, formBase]);

  // useEffect(() => {
  //   setSelectedStatuses(selectedStatuses)
  //   formAdvanced.setFieldsValue({
  //     ...formAdvanced.getFieldsValue(),
  //     status: selectedStatuses
  //   });
  // }, [setSelectedStatuses, selectedStatuses, formAdvanced])

  return (
    <Form.Provider>
      <div className="custom-filter">
        <CustomFilter menu={actions} onMenuClick={onMenuClick}>
          <Form onFinish={onBaseFinish} form={formBase} layout="inline">
            <FilterProcurementStyleWrapper>
              <Item name={ProcurementFilterBasicEnum.Content} className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  allowClear
                  placeholder="Tìm kiếm theo mã PR, mã PO, mã SP"
                />
              </Item>
              <Item name={ProcurementFilterBasicEnum.StoreIds} className="stores">
                <TreeStore
                  style={{ width: 250 }}
                  placeholder="Kho nhận"
                  storeByDepartmentList={listStore}
                />
              </Item>
              <Item className="suppliers">
                <SupplierSearchSelect
                  style={{ width: "100%" }}
                  label
                  name={ProcurementFilterBasicEnum.Suppliers}
                  mode="multiple"
                  help={false}
                  maxTagCount="responsive"
                />
              </Item>
              <Item name={ProcurementFilterBasicEnum.Status}>
                <CustomSelect
                  maxTagCount="responsive"
                  mode="multiple"
                  style={{ width: 160 }}
                  showArrow
                  placeholder="Chọn trạng thái"
                  notFoundContent="Không tìm thấy kết quả"
                  optionFilterProp="children"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {Object.keys(ProcurementStatus).map((item, index) => (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={index.toString()}
                      value={item}
                    >
                      {ProcurementStatusName[item]}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
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
                <Item>
                  <ButtonSetting onClick={onClickOpen} />
                </Item>
              </div>
            </FilterProcurementStyleWrapper>
          </Form>
          <BaseFilter
            onClearFilter={resetFilter}
            onFilter={formAdvanced.submit}
            onCancel={cancelFilter}
            visible={isVisible}
            width={700}
          >
            <Form ref={formRef} onFinish={onAdvanceFinish} form={formAdvanced}>
              <Row gutter={20}>
                {Object.values(ProcurementFilterAdvanceEnum).map((field) => {
                  let component: any = null;
                  switch (field) {
                    case ProcurementFilterAdvanceEnum.Active:
                    case ProcurementFilterAdvanceEnum.ExpectReceipt:
                      component = (
                        <CustomFilterDatePicker
                          fieldNameFrom={`${field}_from`}
                          fieldNameTo={`${field}_to`}
                          activeButton={dateClick}
                          setActiveButton={setDateClick}
                          formRef={formRef}
                        />
                      );
                      break;
                    case ProcurementFilterAdvanceEnum.StockInBys:
                      component = (
                        <AccountSearchPaging placeholder="Chọn người nhập" mode="multiple" />
                      );
                      break;
                    case ProcurementFilterAdvanceEnum.StockIn:
                      component = (
                        <CustomFilterDatePicker
                          fieldNameFrom={`${field}_from`}
                          fieldNameTo={`${field}_to`}
                          activeButton={dateClick}
                          setActiveButton={setDateClick}
                          formRef={formRef}
                          format="DD/MM/YYYY HH:mm"
                          showTime
                        />
                      );
                      break;
                    case ProcurementFilterAdvanceEnum.Merchandisers:
                      component = (
                        <BaseSelectMerchans
                          merchans={merchans}
                          fetchMerchans={fetchMerchans}
                          isLoadingMerchans={isLoadingMerchans}
                          mode={"multiple"}
                        />
                      );
                      break;
                    case ProcurementFilterAdvanceEnum.Note:
                      component = <Input placeholder="Tìm kiếm theo nội dung ghi chú" />;
                      break;
                  }
                  return (
                    <Col span={12} key={field}>
                      <div className="font-weight-500">{ProcurementFilterAdvanceName[field]}</div>
                      {field === ProcurementFilterAdvanceEnum.Note ? (
                        <Item
                          name={field}
                          rules={[
                            {
                              max: 255,
                              message: "Thông tin tìm kiếm không được quá 255 ký tự",
                            },
                          ]}
                        >
                          {component}
                        </Item>
                      ) : (
                        <Item name={field}>{component}</Item>
                      )}
                    </Col>
                  );
                })}
              </Row>
            </Form>
          </BaseFilter>
        </CustomFilter>
        <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
      </div>
    </Form.Provider>
  );
}
export default React.memo(TabListFilter, isEqual);
