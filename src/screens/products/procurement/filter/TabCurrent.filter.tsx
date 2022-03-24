import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import UrlConfig from "config/url.config";
import { SupplierResponse } from "model/core/supplier.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { FilterProcurementStyle } from "./styles";
import { useArray } from "hook/useArray";
import { formatFieldTag, generateQuery, transformParamsToObject } from "utils/AppUtils";
import {
  ProcurementFilterBasicEnum,
  ProcurementFilterBasicName,
  ProcurementFilterProps,
} from "component/filter/interfaces/procurement";
import isEqual from "lodash/isEqual";
import { isArray } from "lodash";
import BaseFilterResult from "component/base/BaseFilterResult";
import { callApiNative } from "../../../../utils/ApiUtils";
import { supplierGetApi } from "../../../../service/core/supplier.service";
const { Item } = Form;

function TabCurrentFilter(props: ProcurementFilterProps) {
  const {
    paramsUrl,
  } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const {array: paramsArray, set: setParamsArray, remove, prevArray} = useArray([])

  const [formBase] = useForm();
  const onBaseFinish = (data: any) => {
    let queryParam = generateQuery({ ...paramsUrl, ...data });
    history.replace(`${UrlConfig.PROCUREMENT}/today?${queryParam}`);
  };

  useEffect(() => {
    const {...rest} = paramsUrl;

    const formatted = formatFieldTag(rest, {...ProcurementFilterBasicName})
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case ProcurementFilterBasicEnum.suppliers:
          if(isArray(item.valueId)) {
            const filterSupplier = allSupplier?.filter((elem) => item.valueId.find((id: number) => +elem.id === +id));
            if(filterSupplier)
              return {...item, valueName: filterSupplier?.map((item: any) => item.name).toString()}
          }
          const findSupplier = allSupplier?.find(supplier => +supplier.id === +item.valueId)
          return {...item, valueName: findSupplier?.name}
        case ProcurementFilterBasicEnum.content:
          return {...item, valueName: item.valueId.toString()}
        default:
          return item
      }
    })
    setParamsArray(transformParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[paramsUrl, JSON.stringify(allSupplier)])

  const onRemoveStatus = useCallback((index: number) => {
    remove(index)
  }, [remove])

  //watch remove tag
  useEffect(() => {
    (async () => {
      if(paramsArray.length < (prevArray?.length || 0)) {
        let newParams = transformParamsToObject(paramsArray)
        await history.push(`${history.location.pathname}?${generateQuery(newParams)}`)
      }
    })();
  }, [paramsArray, history, prevArray])

  const getSupplierByCode = async (ids: string) => {
    const res = await callApiNative({isShowLoading: false}, dispatch, supplierGetApi, {
      ids,
    });
    if (res) setAllSupplier(res.items);
  }

  useEffect(() => {
    formBase.setFieldsValue({
      [ProcurementFilterBasicEnum.suppliers]: paramsUrl.suppliers?.toString()?.split(',').map((x: string) => parseInt(x)),
      [ProcurementFilterBasicEnum.content]: paramsUrl.content,
    });

    if (paramsUrl.suppliers) {
      getSupplierByCode(paramsUrl.suppliers).then();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUrl, formBase]);

  return (
    <Form.Provider>
      <Form onFinish={onBaseFinish} form={formBase} layout="inline">
        <FilterProcurementStyle>
          <Item name={ProcurementFilterBasicEnum.content} className="search">
            <Input
              prefix={<img src={search} alt="" />}
              allowClear
              placeholder="Tìm kiếm theo mã phiếu nhập kho, mã đơn hàng"
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
          <div className="btn-action">
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
          </div>
        </FilterProcurementStyle>
      </Form>
      <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
    </Form.Provider>
  );
}
export default React.memo(TabCurrentFilter, isEqual);
