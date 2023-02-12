import { Button, Col, Form, FormInstance, Input, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import { SupplierResponse } from "model/core/supplier.model";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { FilterProcurementStyleWrapper } from "../styles";
import { useArray } from "hook/useArray";
import { formatFieldTag, generateQuery, transformParamsToObject } from "utils/AppUtils";
import {
  ProcurementFilterAdvanceName,
  ProcurementFilterBasicEnum,
  ProcurementFilterBasicName,
  ProcurementFilterProps,
  ProcurementTodayFilterAdvanceEnum,
} from "component/filter/interfaces/procurement";
import isEqual from "lodash/isEqual";
import { isArray } from "lodash";
import BaseFilterResult from "component/base/BaseFilterResult";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import TreeStore from "component/CustomTreeSelect";
import CustomSelect from "component/custom/select.custom";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import CustomFilter from "component/table/custom.filter";
import { FilterOutlined } from "@ant-design/icons";
import ButtonSetting from "component/table/ButtonSetting";
import BaseFilter from "component/filter/base.filter";
import { ProcurementTabUrl } from "config/url.config";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import { useFetchMerchans } from "hook/useFetchMerchans";
import {
  DATE_FORMAT,
  formatDateFilter,
  formatDateTimeFilter,
  splitDateRange,
} from "utils/DateUtils";
import moment from "moment";
import { supplierGetApi } from "service/core/supplier.service";
import { callApiNative } from "utils/ApiUtils";
const { Item } = Form;

function TabCurrentFilter(props: ProcurementFilterProps) {
  const { paramsUrl, actions, onMenuClick, onClickOpen, accounts } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const [dateClick, setDateClick] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([]);
  const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();
  const [stores, setStores] = useState<Array<StoreResponse>>([] as Array<StoreResponse>);

  const [formBase] = useForm();
  const [formAdvanced] = useForm();
  const onBaseFinish = (data: any) => {
    if (data.content) {
      data = {
        ...data,
        content: data.content.trim(),
      };
    }
    let queryParam = generateQuery({ ...paramsUrl, ...data, page: 1 });
    history.replace(`${history.location.pathname}?${queryParam}`);
  };

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

  const formatDateRange = (from: Date, to: Date) => {
    if (!from && !to) return;
    return `${from ? moment(from).utc(false).format(DATE_FORMAT.DD_MM_YY_HHmm) : "??"} ~ ${
      to ? moment(to).utc(false).format(DATE_FORMAT.DD_MM_YY_HHmm) : "??"
    }`;
  };

  useEffect(() => {
    if (history.location.pathname !== ProcurementTabUrl.TODAY) {
      return;
    }
    const newParams = {
      ...paramsUrl,
      active: formatDateRange(paramsUrl.active_from, paramsUrl.active_to),
    };
    // delete params date
    const { active_from, active_to, ...rest } = newParams;

    const formatted = formatFieldTag(rest, {
      ...ProcurementFilterBasicName,
      ...ProcurementFilterAdvanceName,
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
        case ProcurementFilterBasicEnum.Content:
          return { ...item, valueName: item.valueId.toString() };
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
        case ProcurementFilterBasicEnum.StoreIds:
          if (isArray(item.valueId)) {
            const filterStore = stores?.filter((elem) =>
              item.valueId.find((id: number) => +elem.id === +id),
            );
            if (filterStore)
              return {
                ...item,
                valueName: filterStore?.map((item: any) => item.name).toString(),
              };
          }
          const findStore = stores.find((el) => el.id === parseInt(item.valueId));
          return { ...item, valueName: findStore?.name };
        case ProcurementTodayFilterAdvanceEnum.StockInBys:
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
        case ProcurementTodayFilterAdvanceEnum.Merchandisers:
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
        case ProcurementTodayFilterAdvanceEnum.Active:
        case ProcurementTodayFilterAdvanceEnum.Note:
          return { ...item, valueName: item.valueId.toString() };
        default:
          return item;
      }
    });
    setParamsArray(transformParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, JSON.stringify(allSupplier), JSON.stringify(stores), setParamsArray]);

  const onRemoveStatus = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const onAdvanceFinish = async (data: any) => {
    setIsVisible(false);
    let queryParam = generateQuery({
      ...paramsUrl,
      ...data,
      page: 1,
      active_from: formatDateTimeFilter(data.active_from, DATE_FORMAT.DD_MM_YY_HHmm)?.format(),
      active_to: formatDateTimeFilter(data.active_to, DATE_FORMAT.DD_MM_YY_HHmm)?.format(),
    });

    await history.replace(`${ProcurementTabUrl.TODAY}?${queryParam}`);
  };

  const removeDate = (params: any, key: string) => {
    const { start, end } = splitDateRange(params[key]);
    params[`${key}_from`] = start !== "??" ? start : undefined;
    params[`${key}_to`] = end !== "??" ? end : undefined;
  };

  //watch remove tag
  useEffect(() => {
    if (history.location.pathname !== ProcurementTabUrl.TODAY) {
      return;
    }
    (async () => {
      if (paramsArray.length < (prevArray?.length || 0)) {
        let newParams = transformParamsToObject(paramsArray);
        if (newParams?.active) {
          removeDate(newParams, ProcurementTodayFilterAdvanceEnum.Active);
          const { start, end } = splitDateRange(
            newParams[ProcurementTodayFilterAdvanceEnum.Active],
          );
          newParams = {
            ...newParams,
            active_from:
              start !== "??"
                ? formatDateTimeFilter(start, DATE_FORMAT.DD_MM_YY_HHmm)?.format()
                : undefined,
            active_to:
              end !== "??"
                ? formatDateTimeFilter(end, DATE_FORMAT.DD_MM_YY_HHmm)?.format()
                : undefined,
          };
        }
        delete newParams[ProcurementTodayFilterAdvanceEnum.Active];
        await history.push(`${history.location.pathname}?${generateQuery(newParams)}`);
      }
    })();
  }, [history, prevArray, paramsArray]);

  const getSupplierByCode = async (ids: string) => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, supplierGetApi, {
      ids,
    });
    if (res) setAllSupplier(res.items);
  };

  useEffect(() => {
    if (history.location.pathname !== ProcurementTabUrl.TODAY) {
      return;
    }
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
      ...paramsUrl,
      active_from: formatDateFilter(paramsUrl.active_from),
      active_to: formatDateFilter(paramsUrl.active_to),
      merchandisers: paramsUrl.merchandisers,
      stock_in_bys: paramsUrl.stock_in_bys,
      note: paramsUrl.note,
    });

    if (paramsUrl.suppliers) {
      getSupplierByCode(paramsUrl.suppliers).then();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, formBase]);

  useEffect(() => {
    const getStores = async () => {
      const res = await callApiNative({ isShowError: true }, dispatch, getStoreApi, {
        status: "active",
        simple: true,
      });
      if (res) {
        setStores(res);
      }
    };
    getStores();
  }, [dispatch]);

  return (
    <Form.Provider>
      <div className="custom-filter">
        <CustomFilter menu={actions} onMenuClick={onMenuClick}>
          <Form onFinish={onBaseFinish} form={formBase} layout="inline">
            <FilterProcurementStyleWrapper>
              <Item
                name={ProcurementFilterBasicEnum.Content}
                className="search"
                rules={[
                  {
                    max: 255,
                    message: "Thông tin tìm kiếm không được quá 255 ký tự",
                  },
                ]}
              >
                <Input
                  prefix={<img src={search} alt="" />}
                  allowClear
                  placeholder="Tìm kiếm theo mã phiếu nhập kho, mã đơn hàng, mã tham chiếu"
                />
              </Item>
              <Item
                name={ProcurementFilterBasicEnum.StoreIds}
                className="stores"
                style={{ minWidth: 250, maxWidth: 300 }}
              >
                <TreeStore
                  placeholder="Chọn kho nhận"
                  storeByDepartmentList={stores as unknown as StoreByDepartment[]}
                />
              </Item>
              <Item className="suppliers" style={{ minWidth: 200, maxWidth: 250 }}>
                <SupplierSearchSelect
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
                  style={{ width: 200 }}
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
                {Object.values(ProcurementTodayFilterAdvanceEnum).map((field) => {
                  let component: any = null;
                  switch (field) {
                    case ProcurementTodayFilterAdvanceEnum.Active:
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
                    case ProcurementTodayFilterAdvanceEnum.Note:
                      component = <Input placeholder="Tìm kiếm theo nội dung ghi chú" />;
                      break;
                    case ProcurementTodayFilterAdvanceEnum.StockInBys:
                      component = (
                        <AccountSearchPaging placeholder="Chọn người nhập" mode="multiple" />
                      );
                      break;
                    case ProcurementTodayFilterAdvanceEnum.Merchandisers:
                      component = (
                        <BaseSelectMerchans
                          merchans={merchans}
                          fetchMerchans={fetchMerchans}
                          isLoadingMerchans={isLoadingMerchans}
                          mode={"multiple"}
                        />
                      );
                      break;
                  }
                  return (
                    <Col span={12} key={field}>
                      <div className="font-weight-500">{ProcurementFilterAdvanceName[field]}</div>
                      {field === ProcurementTodayFilterAdvanceEnum.Note ? (
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
export default React.memo(TabCurrentFilter, isEqual);
