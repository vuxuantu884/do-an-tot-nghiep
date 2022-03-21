import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import ButtonSetting from "component/table/ButtonSetting";
import UrlConfig from "config/url.config";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { StoreResponse } from "model/core/store.model";
import { SupplierResponse } from "model/core/supplier.model";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { ProcurementStatus, ProcurementStatusName } from "utils/Constants";
import { FilterProcurementStyle, ProcurementStatusStyle } from "./styles";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { splitDateRange } from "utils/DateUtils";
import BaseFilterResult from "component/base/BaseFilterResult";
import { useArray } from "hook/useArray";
import { formatFieldTag, generateQuery, transformParamsToObject } from "utils/AppUtils";
import {
  ProcurementFilter,
  ProcurementFilterAdvanceEnum,
  ProcurementFilterAdvanceName,
  ProcurementFilterBasicEnum,
  ProcurementFilterBasicName,
  ProcurementFilterProps,
} from "component/filter/interfaces/procurement";
import isEqual from "lodash/isEqual";
import { isArray } from "lodash";
import BaseSelectMerchans from "../../../../component/base/BaseSelect/BaseSelectMerchans";
import {useFetchMerchans} from "../../../../hook/useFetchMerchans";

const { Item } = Form;

function TabListFilter(props: ProcurementFilterProps) {
  const {
    onClickOpen,
    paramsUrl,
  } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>()
  const {fetchMerchans, merchans, isLoadingMerchans} = useFetchMerchans()
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState('');
  const [allStore, setAllStore] = useState<Array<StoreResponse>>();
  const {array: selectedStatuses, set: setSelectedStatuses, remove: removeStatus} = useArray([])
  const {array: paramsArray, set: setParamsArray, remove, prevArray} = useArray([])

  const [formBase] = useForm();
  const [formAdvanced] = useForm();

  const openVisibleFilter = () => setVisible(true)
  const cancelFilter = () => setVisible(false)

  const resetFilter = () => {
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
  }

  const onAdvanceFinish = async (data: ProcurementFilter) => {
    setVisible(false);
    setSelectedStatuses(formAdvanced.getFieldValue('status'))
    await history.replace(`${UrlConfig.PROCUREMENT}?${generateQuery({ ...paramsUrl, ...data })}`);
  }

  const handleClickStatus = (value: string) => {
    const findSelected = selectedStatuses.find(status => status === value)
    if(!findSelected) {
      setSelectedStatuses([...selectedStatuses, value])
    } else {
      const findIndexSelected = selectedStatuses.findIndex(status => status === value)
      removeStatus(findIndexSelected)
    }
  }

  const onRemoveStatus = useCallback((index: number) => {
    remove(index)
  }, [remove])

  const convertParams = (params: any) => {
    return {
      ...params,
      [ProcurementFilterAdvanceEnum.status]: params.status,
      [ProcurementFilterAdvanceEnum.stores]: params.stores?.toString()?.split(',').map((x: string) => parseInt(x)),
    };
  }

  const onBaseFinish = (data: any) => {
    let queryParam = generateQuery({ ...paramsUrl, ...data });
    history.replace(`${UrlConfig.PROCUREMENT}?${queryParam}`);
  };

  const formatDateRange = (from: Date, to: Date) => {
    if(!from && !to) return
    return `${from || '??'} ~ ${to || '??'}`
  }

  useEffect(() => {
    dispatch(SupplierGetAllAction((suppliers) => setAllSupplier(suppliers)))
    dispatch(getListStoresSimpleAction((stores) =>  setAllStore(stores)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newParams = {
      ...paramsUrl,
      active: formatDateRange(paramsUrl.active_from, paramsUrl.active_to),
      stock_in: formatDateRange(paramsUrl.stock_in_from, paramsUrl.stock_in_to),
      expect_receipt: formatDateRange(paramsUrl.expect_receipt_from, paramsUrl.expect_receipt_to),
    }
    // delete params date
    const { active_from, active_to, stock_in_from, stock_in_to, expect_receipt_from, expect_receipt_to, ...rest} = newParams

    const formatted = formatFieldTag(rest, {...ProcurementFilterAdvanceName, ...ProcurementFilterBasicName})
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case ProcurementFilterBasicEnum.suppliers:
          if(isArray(item.valueId)) {
            const filterSupplier = allSupplier?.filter((elem) => item.valueId.find((id: number) => +elem.id === +id));
            if(filterSupplier)
            return {...item, valueName: filterSupplier?.map((item: any) => item.pic).toString()}
          }
          const findSupplier = allSupplier?.find(supplier => +supplier.id === +item.valueId)
          return {...item, valueName: findSupplier?.name}
        case ProcurementFilterAdvanceEnum.stores:
          if(isArray(item.valueId)) {
            const filterStore = allStore?.filter((elem) => item.valueId.find((id: number) => +elem.id === +id));
            if(filterStore)
            return {...item, valueName: filterStore?.map((item: any) => item.department).toString()}
          }
          const findStore= allStore?.find(store => +store.id === +item.valueId)
          return {...item, valueName: findStore?.department}
        case ProcurementFilterAdvanceEnum.status:
          let statuses: any = [];
          if(isArray(item.valueId)) {
            item.valueId.forEach((item: any) => {statuses.push(ProcurementStatusName[item])})
          } else {
            statuses = ProcurementStatusName[item.valueId]
          }
          return {...item, valueName: statuses?.toString()}
        case ProcurementFilterBasicEnum.content:
        case ProcurementFilterBasicEnum.merchandisers:
        case ProcurementFilterAdvanceEnum.active:
        case ProcurementFilterAdvanceEnum.stock_in:
        case ProcurementFilterAdvanceEnum.expect_receipt:
          return {...item, valueName: item.valueId.toString()}
        default:
          return item
      }
    })
    setParamsArray(transformParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[paramsUrl, JSON.stringify(allStore), JSON.stringify(allSupplier)])

  const removeDate = (params: any, key: string) => {
    const {start, end} = splitDateRange(params[key])
    params[`${key}_from`] = start !== "??" ? start : undefined
    params[`${key}_to`] = end !== "??" ? end : undefined
  }

  //watch remove tag
  useEffect(() => {
    (async () => {
      if(paramsArray.length < (prevArray?.length || 0)) {
        const filterStatusInParams = paramsArray.filter((item: any) => item.keyId === 'status').map((param: any) => param.status)
        setSelectedStatuses(filterStatusInParams)
        let newParams = transformParamsToObject(paramsArray)
        if(newParams?.active) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.active)
        }
        if(newParams?.stock_in) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.stock_in)
        }
        if(newParams?.expect_receipt) {
          removeDate(newParams, ProcurementFilterAdvanceEnum.expect_receipt)
        }
        delete newParams[ProcurementFilterAdvanceEnum.active]
        delete newParams[ProcurementFilterAdvanceEnum.stock_in]
        delete newParams[ProcurementFilterAdvanceEnum.expect_receipt]
        await history.push(`${history.location.pathname}?${generateQuery(newParams)}`)
      }
    })();
  }, [setSelectedStatuses, paramsArray, history, prevArray])

  useEffect(() => {
    const filters = convertParams(paramsUrl);
    formBase.setFieldsValue({
      [ProcurementFilterBasicEnum.suppliers]: paramsUrl.suppliers?.toString()?.split(',').map((x: string) => parseInt(x)),
      [ProcurementFilterBasicEnum.content]: paramsUrl.content,
      [ProcurementFilterBasicEnum.merchandisers]: paramsUrl.merchandisers?.toString()?.split(','),
    })
    formAdvanced.setFieldsValue({
      ...filters,
      status: filters.status,
      active_from: filters.active_from,
      active_to: filters.active_to,
      stock_in_from: filters.stock_in_from,
      stock_in_to: filters.stock_in_to,
      expect_receipt_from: filters.expect_receipt_from,
      expect_receipt_to: filters.expect_receipt_to,
    });
  }, [formAdvanced, paramsUrl, formBase]);

  useEffect(() => {
    setSelectedStatuses(selectedStatuses)
    formAdvanced.setFieldsValue({
      ...formAdvanced.getFieldsValue(),
      status: selectedStatuses
    });
  }, [setSelectedStatuses, selectedStatuses, formAdvanced])

  return (
    <Form.Provider>
      <Form onFinish={onBaseFinish} form={formBase} layout="inline">
        <FilterProcurementStyle>
          <Item name={ProcurementFilterBasicEnum.content} className="search">
            <Input
              prefix={<img src={search} alt="" />}
              allowClear
              placeholder="Tìm kiếm theo ID phiếu nhập kho, mã đơn đặt hàng"
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
          <Item className="merchandisers" name={ProcurementFilterBasicEnum.merchandisers}>
            <BaseSelectMerchans
              merchans={merchans}
              fetchMerchans={fetchMerchans}
              isLoadingMerchans={isLoadingMerchans}
              mode={"multiple"}
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
                case ProcurementFilterAdvanceEnum.stock_in:
                case ProcurementFilterAdvanceEnum.expect_receipt:
                  component = <CustomFilterDatePicker
                    fieldNameFrom={`${field}_from`}
                    fieldNameTo={`${field}_to`}
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />;
                  break;
                case ProcurementFilterAdvanceEnum.stores:
                  component = <TreeStore name={field} form={formAdvanced} listStore={allStore}/>;
                  break;
                case ProcurementFilterAdvanceEnum.status:
                  component = (
                    <ProcurementStatusStyle>
                      {Object.keys(ProcurementStatus).map((item) => (
                        <Button
                          key={item}
                          value={item}
                          onClick={() => handleClickStatus(item)}
                          className={selectedStatuses?.includes(item) ? "active" : ""}
                        >
                          {ProcurementStatusName[item]}
                        </Button>
                      ))}
                    </ProcurementStatusStyle>
                  );
                  break;
              }
              return (
                <Col span={field === ProcurementFilterAdvanceEnum.status ? 24 : 12} key={field}>
                  <div className="font-weight-500">{ProcurementFilterAdvanceName[field]}</div>
                  <Item name={field}>{component}</Item>
                </Col>
              );
            })}
          </Row>
        </Form>
      </BaseFilter>
      <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
    </Form.Provider>
  );
}
export default React.memo(TabListFilter, isEqual);
