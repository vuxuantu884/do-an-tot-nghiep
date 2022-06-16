import { Button, Col, Form, Input, Row, Select } from "antd";
import { ProcurementFilterBasicEnum, ProcurementFilterBasicName, ProcurementItemsFilterAdvanceEnum, ProcurementItemsFilterAdvanceName } from "component/filter/interfaces/procurement"
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { FilterProcurementStyle } from "./styles";
import search from "assets/img/search.svg";
import ButtonSetting from "component/table/ButtonSetting";
import { FilterOutlined } from "@ant-design/icons";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { useForm, FormInstance } from "antd/es/form/Form";
import { StoreResponse } from "model/core/store.model";
import { callApiNative } from "utils/ApiUtils";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { ProcurementTabUrl } from "config/url.config";
import { formatFieldTag, generateQuery, transformParamsToObject } from "utils/AppUtils";
import { debounce, isArray, isEmpty } from "lodash";
import { useArray } from "hook/useArray";
import BaseFilterResult from "component/base/BaseFilterResult";
import BaseFilter from "component/filter/base.filter";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { splitDateRange } from "utils/DateUtils";

interface ProcurementItemsFilterProps {
  onClickOpen?: () => void;
  paramsUrl?: any;
}

const TabProductsFilter: React.FC<ProcurementItemsFilterProps> = (props: ProcurementItemsFilterProps) => {
  const {
    onClickOpen,
    paramsUrl,
  } = props;

  const history = useHistory();
  const dispatch = useDispatch();
  const [formBase] = useForm();
  const formRef = createRef<FormInstance>()
  const [formAdvanced] = useForm();
  const { Item } = Form
  const [allStore, setAllStore] = useState<Array<StoreResponse>>();
  const [allAccounts, setAllAccounts] = useState<Array<AccountResponse>>([])
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState('');
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([])

  useEffect(() => {
    const getStores = async () => {
      const res = await callApiNative({ isShowError: true }, dispatch, getStoreApi, { status: "active", simple: true })
      if (res) {
        setAllStore(res)
      }
    }
    getStores()
  }, [dispatch]);

  const formatDateRange = (from: Date, to: Date) => {
    if (!from && !to) return
    return `${from || '??'} ~ ${to || '??'}`
  }

  const onRemoveStatus = useCallback((index: number) => {
    remove(index)
  }, [remove])

  const removeDate = (params: any, key: string) => {
    const { start, end } = splitDateRange(params[key])
    params[`${key}_from`] = start !== "??" ? start : undefined
    params[`${key}_to`] = end !== "??" ? end : undefined
  }

  useEffect(() => {
    (async () => {
      if (paramsArray.length < (prevArray?.length || 0)) {
        let newParams = transformParamsToObject(paramsArray)
        if (newParams?.stock_in_date) {
          removeDate(newParams, ProcurementItemsFilterAdvanceEnum.stock_in_date)
        }
        delete newParams[ProcurementItemsFilterAdvanceEnum.stock_in_date]
        await history.push(`${history.location.pathname}?${generateQuery(newParams)}`)
      }
    })();
  }, [paramsArray, history, prevArray])

  useEffect(() => {
    const newParams = {
      ...paramsUrl,
      stock_in_date: formatDateRange(paramsUrl.stock_in_date_from, paramsUrl.stock_in_date_to),
    }
    // delete params date
    const { stock_in_date_from, stock_in_date_to, ...rest } = newParams

    const formatted = formatFieldTag(rest, { ...ProcurementItemsFilterAdvanceName, ...ProcurementFilterBasicName })
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case ProcurementFilterBasicEnum.store_ids:
          if (isArray(item.valueId)) {
            const filterStore = allStore?.filter((elem) => item.valueId.find((id: number) => +elem.id === +id));
            if (filterStore)
              return { ...item, valueName: filterStore?.map((item: any) => item.name).toString() }
          }
          const findStore = allStore?.find(store => +store.id === +item.valueId)
          return { ...item, valueName: findStore?.name }
        case ProcurementFilterBasicEnum.content:
        case ProcurementItemsFilterAdvanceEnum.stock_in_date:
        case ProcurementItemsFilterAdvanceEnum.note:
        case ProcurementItemsFilterAdvanceEnum.stock_in_by:
          return { ...item, valueName: item.valueId.toString() }
        default:
          return item
      }
    })
    setParamsArray(transformParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, JSON.stringify(allStore)])

  useEffect(() => {
    formBase.setFieldsValue({
      [ProcurementFilterBasicEnum.content]: paramsUrl.content,
      [ProcurementFilterBasicEnum.store_ids]: paramsUrl.stores?.toString()?.split(',').map((x: string) => parseInt(x)),
    })
    formAdvanced.setFieldsValue({
      ...paramsUrl,
      stock_in_by: paramsUrl.stock_in_by,
      stock_in_date_from: paramsUrl.stock_in_date_from,
      stock_in_date_to: paramsUrl.stock_in_date_to,
      note: paramsUrl.note,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAdvanced, paramsUrl, formBase]);

  const cancelFilter = () => setVisible(false)

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
  }

  const openVisibleFilter = () => setVisible(true)

  const onBaseFinish = (data: any) => {
    let queryParam = generateQuery({ ...paramsUrl, ...data, page: 1 });
    history.replace(`${ProcurementTabUrl.PRODUCTS}?${queryParam}`);
  };

  const onAdvanceFinish = (data: any) => {
    setVisible(false);
    history.replace(`${ProcurementTabUrl.PRODUCTS}?${generateQuery({ ...paramsUrl, ...data, page: 1 })}`);
  }

  const onSearch = debounce((content: string) => {
    let queryParam = generateQuery({ ...paramsUrl, content, page: 1 });
    history.replace(`${ProcurementTabUrl.PRODUCTS}?${queryParam}`);
  }, 300)

  const onSearchAccount = debounce(async (value: string) => {
    const res = await callApiNative({ isShowError: true }, dispatch, searchAccountPublicApi, { condition: value })
    if (res) {
      setAllAccounts(res.items)
    }
  }, 300)

  return (
    <Form.Provider>
      <Form onFinish={onBaseFinish} form={formBase} layout="inline">
        <FilterProcurementStyle>
          <Item name={ProcurementFilterBasicEnum.content} className="search">
            <Input
              prefix={<img src={search} alt="" />}
              allowClear
              placeholder="Tìm kiếm theo mã phiếu nhập kho, mã sản phẩm, tên sản phẩm"
              onChange={(e) => {
                const content = e.target.value
                if (content.length > 2) {
                  onSearch(content)
                }
              }}
            />
          </Item>
          <Item name={ProcurementFilterBasicEnum.store_ids} className="stores" style={{ minWidth: 200 }}>
            <TreeStore
              form={formBase}
              name={ProcurementFilterBasicEnum.store_ids}
              placeholder="Chọn kho nhận"
              listStore={allStore}
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
        width={600}
      >
        <Form ref={formRef} onFinish={onAdvanceFinish} form={formAdvanced}>
          {
            Object.values(ProcurementItemsFilterAdvanceEnum).map(field => {
              let component: any = null;
              switch (field) {
                case ProcurementItemsFilterAdvanceEnum.stock_in_date:
                  component = <CustomFilterDatePicker
                    fieldNameFrom={`${field}_from`}
                    fieldNameTo={`${field}_to`}
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                    format="DD/MM/YYYY HH:mm"
                    showTime
                  />;
                  break;
                case ProcurementItemsFilterAdvanceEnum.stock_in_by:
                  component = <Select
                    allowClear
                    showSearch
                    showArrow
                    optionFilterProp="children"
                    placeholder="Tìm theo người nhận"
                    onSearch={onSearchAccount}
                  >
                    {!isEmpty(allAccounts) && allAccounts.map((item) => (
                      <Select.Option key={item.id} value={item.code}>
                        {item.code} - {item.full_name}
                      </Select.Option>
                    ))}
                  </Select>
                  break;
                case ProcurementItemsFilterAdvanceEnum.note:
                  component = <Input placeholder="Tìm theo ghi chú" />
                  break;
                default:
                  break;
              }
              return (
                <Row gutter={20}>
                  <Col span={24} key={field}>
                    <div className="font-weight-500">{ProcurementItemsFilterAdvanceName[field]}</div>
                    <Item name={field}>{component}</Item>
                  </Col>
                </Row>
              );
            })
          }
        </Form>
      </BaseFilter>
      <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
    </Form.Provider>
  )
}

export default TabProductsFilter