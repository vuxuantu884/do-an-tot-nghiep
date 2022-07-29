import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import ButtonSetting from "component/table/ButtonSetting";
import UrlConfig from "config/url.config";
// import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { StoreResponse } from "model/core/store.model";
import { SupplierResponse } from "model/core/supplier.model";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import { FilterProcurementStyle } from "./styles";
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
import BaseSelectMerchans from "../../../../component/base/BaseSelect/BaseSelectMerchans";
import { useFetchMerchans } from "../../../../hook/useFetchMerchans";
import { callApiNative } from "../../../../utils/ApiUtils";
import { supplierGetApi } from "../../../../service/core/supplier.service";
import { getStoreApi } from "service/inventory/transfer/index.service";
import CustomSelect from "component/custom/select.custom";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";

const { Item } = Form;

interface ProcurementTabListFilterProps extends ProcurementFilterProps {
  actions: Array<MenuAction>;
  onMenuClick: (index: number) => void;
}

function TabListFilter(props: ProcurementTabListFilterProps) {
  const { onClickOpen, paramsUrl, accounts, actions, onMenuClick } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState("");
  const [allStore, setAllStore] = useState<Array<StoreResponse>>();
  // const { array: selectedStatuses, set: setSelectedStatuses, remove: removeStatus } = useArray([])
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([]);

  const [formBase] = useForm();
  const [formAdvanced] = useForm();

  const openVisibleFilter = () => setVisible(true);
  const cancelFilter = () => setVisible(false);

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
    setVisible(false);
  };

  const onAdvanceFinish = async (data: any) => {
    setVisible(false);
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
    // dispatch(getListStoresSimpleAction((stores) => setAllStore(stores)));
    const getStores = async () => {
      const res = await callApiNative({ isShowError: true }, dispatch, getStoreApi, {
        status: "active",
        simple: true,
      });
      if (res) {
        setAllStore(res);
      }
    };
    getStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
        case ProcurementFilterBasicEnum.suppliers:
          if (isArray(item.valueId)) {
            const filterSupplier = allSupplier?.filter((elem) =>
              item.valueId.find((id: number) => +elem.id === +id),
            );
            if (filterSupplier)
              return {
                ...item,
                valueName: filterSupplier?.map((item: any) => item.pic).toString(),
              };
          }
          const findSupplier = allSupplier?.find((supplier) => +supplier.id === +item.valueId);
          return { ...item, valueName: findSupplier?.name };
        case ProcurementFilterBasicEnum.store_ids:
          if (isArray(item.valueId)) {
            const filterStore = allStore?.filter((elem) =>
              item.valueId.find((id: number) => +elem.id === +id),
            );
            if (filterStore)
              return {
                ...item,
                valueName: filterStore?.map((item: any) => item.name).toString(),
              };
          }
          const findStore = allStore?.find((store) => +store.id === +item.valueId);
          return { ...item, valueName: findStore?.name };
        case ProcurementFilterBasicEnum.status:
          let statuses: any = [];
          if (isArray(item.valueId)) {
            item.valueId.forEach((item: any) => {
              statuses.push(ProcurementStatusName[item]);
            });
          } else {
            statuses = ProcurementStatusName[item.valueId];
          }
          return { ...item, valueName: statuses?.toString() };
        case ProcurementFilterAdvanceEnum.stock_in_bys:
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
        case ProcurementFilterAdvanceEnum.merchandisers:
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
        case ProcurementFilterBasicEnum.content:
        case ProcurementFilterAdvanceEnum.active:
        case ProcurementFilterAdvanceEnum.stock_in:
        case ProcurementFilterAdvanceEnum.expect_receipt:
        case ProcurementFilterAdvanceEnum.note:
          return { ...item, valueName: item.valueId.toString() };
        default:
          return item;
      }
    });
    setParamsArray(transformParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, JSON.stringify(allStore), JSON.stringify(allSupplier), accounts]);

  const removeDate = (params: any, key: string) => {
    const { start, end } = splitDateRange(params[key]);
    params[`${key}_from`] = start !== "??" ? start : undefined;
    params[`${key}_to`] = end !== "??" ? end : undefined;
  };

  //watch remove tag
  useEffect(() => {
    (async () => {
      if (paramsArray.length < (prevArray?.length || 0)) {
        // const filterStatusInParams = paramsArray.filter((item: any) => item.keyId === 'status').map((param: any) => param.status)
        // setSelectedStatuses(filterStatusInParams)
        let newParams = transformParamsToObject(paramsArray);
        if (newParams?.active) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.active);
        }
        if (newParams?.stock_in) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.stock_in);
        }
        if (newParams?.expect_receipt) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.expect_receipt);
        }
        delete newParams[ProcurementFilterAdvanceEnum.active];
        delete newParams[ProcurementFilterAdvanceEnum.stock_in];
        delete newParams[ProcurementFilterAdvanceEnum.expect_receipt];
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
    const filters = convertParams(paramsUrl);
    formBase.setFieldsValue({
      [ProcurementFilterBasicEnum.suppliers]: paramsUrl.suppliers
        ?.toString()
        ?.split(",")
        .map((x: string) => parseInt(x)),
      [ProcurementFilterBasicEnum.content]: paramsUrl.content,
      [ProcurementFilterBasicEnum.status]: paramsUrl.status,
      [ProcurementFilterBasicEnum.store_ids]: paramsUrl.stores
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
            <FilterProcurementStyle>
              <Item name={ProcurementFilterBasicEnum.content} className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  allowClear
                  placeholder="Tìm kiếm theo ID phiếu nhập kho, mã đơn đặt hàng, Mã tham chiếu"
                />
              </Item>
              <Item
                name={ProcurementFilterBasicEnum.store_ids}
                className="stores"
                style={{ minWidth: 200 }}
              >
                <TreeStore
                  form={formBase}
                  name={ProcurementFilterBasicEnum.store_ids}
                  placeholder="Chọn kho nhận"
                  listStore={allStore}
                />
              </Item>
              <Item className="suppliers">
                <SupplierSearchSelect
                  label
                  name={ProcurementFilterBasicEnum.suppliers}
                  mode="multiple"
                  help={false}
                  maxTagCount="responsive"
                />
              </Item>
              <Item name={ProcurementFilterBasicEnum.status}>
                <CustomSelect
                  maxTagCount="responsive"
                  mode="multiple"
                  style={{ minWidth: 180 }}
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
            </FilterProcurementStyle>
          </Form>
          <BaseFilter
            onClearFilter={resetFilter}
            onFilter={formAdvanced.submit}
            onCancel={cancelFilter}
            visible={visible}
            width={700}
          >
            <Form ref={formRef} onFinish={onAdvanceFinish} form={formAdvanced}>
              <Row gutter={20}>
                {Object.values(ProcurementFilterAdvanceEnum).map((field) => {
                  let component: any = null;
                  switch (field) {
                    case ProcurementFilterAdvanceEnum.active:
                    case ProcurementFilterAdvanceEnum.expect_receipt:
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
                    case ProcurementFilterAdvanceEnum.stock_in_bys:
                      component = (
                        <AccountSearchPaging placeholder="Chọn người nhập" mode="multiple" />
                      );
                      break;
                    case ProcurementFilterAdvanceEnum.stock_in:
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
                    case ProcurementFilterAdvanceEnum.merchandisers:
                      component = (
                        <BaseSelectMerchans
                          merchans={merchans}
                          fetchMerchans={fetchMerchans}
                          isLoadingMerchans={isLoadingMerchans}
                          mode={"multiple"}
                        />
                      );
                      break;
                    case ProcurementFilterAdvanceEnum.note:
                      component = <Input placeholder="Tìm kiếm theo nội dung ghi chú" />;
                      break;
                  }
                  return (
                    <Col span={12} key={field}>
                      <div className="font-weight-500">{ProcurementFilterAdvanceName[field]}</div>
                      {field === ProcurementFilterAdvanceEnum.note ? (
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
