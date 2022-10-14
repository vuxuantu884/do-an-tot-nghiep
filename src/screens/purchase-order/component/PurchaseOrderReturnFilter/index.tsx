import { Button, Form, Input, Tag } from "antd";
import CustomFilter from "component/table/custom.filter";
import React, { Fragment, useEffect, useState } from "react";
import { POReturnFiltersWrapper } from "./style";
import search from "assets/img/search.svg";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import { useFetchMerchans } from "hook/useFetchMerchans";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { StoreResponse } from "model/core/store.model";
import { SupplierResponse } from "model/core/supplier.model";
import { useDispatch } from "react-redux";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import {
  filterPOReturnFieldsMapping,
  POReturnFilterField,
} from "screens/purchase-order/tab/PurchaseOrderReturn/helper";
import ButtonSetting from "component/table/ButtonSetting";
import { PurchaseOrderReturnQuery } from "model/purchase-order/purchase-order.model";
import { isArray } from "lodash";
import { useHistory } from "react-router-dom";
import { PurchaseOrderTabUrl } from "screens/purchase-order/helper";
import BaseFilterResult from "component/base/BaseFilterResult";
import { useArray } from "hook/useArray";
import { callApiNative } from "utils/ApiUtils";
import { supplierGetApi } from "service/core/supplier.service";
import { formatFieldTag, generateQuery, transformParamsToObject } from "utils/AppUtils";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { StoreGetListAction } from "domain/actions/core/store.action";

type POReturnFilterProps = {
  params: PurchaseOrderReturnQuery;
  onFilter: (values: PurchaseOrderReturnQuery) => void;
  openSetting: () => void;
  setParams: (params: PurchaseOrderReturnQuery) => void;
};

const tagRender = (props: any) => {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose}>
      {label}
    </Tag>
  );
};

const PurchaseOrderReturnFilter: React.FC<POReturnFilterProps> = (props: POReturnFilterProps) => {
  const { onFilter, params, openSetting, setParams } = props;
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([]);
  const [allStore, setAllStore] = useState<Array<StoreResponse>>([]);
  const [formBaseFilter] = Form.useForm();
  const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();
  const dispatch = useDispatch();
  const history = useHistory();
  const { Item } = Form;

  useEffect(() => {
    if (!params.supplier_ids) {
      dispatch(SupplierGetAllAction((suppliers) => setAllSupplier(suppliers)));
    }
    dispatch(StoreGetListAction(setAllStore));
  }, [dispatch, params]);

  const getSupplierByCode = async (ids: string) => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, supplierGetApi, {
      ids,
    });
    if (res) setAllSupplier(res.items);
  };

  useEffect(() => {
    if (history.location.pathname !== PurchaseOrderTabUrl.RETURN) {
      return;
    }
    formBaseFilter.setFieldsValue({
      [POReturnFilterField.supplier_ids]: params.supplier_ids
        ?.toString()
        ?.split(",")
        .map((x: string) => parseInt(x)),
      [POReturnFilterField.info]: params.info,
      [POReturnFilterField.merchandisers]: params.merchandisers,
      [POReturnFilterField.store_ids]: params.store_ids
        ?.toString()
        ?.split(",")
        .map((x: string) => parseInt(x)),
    });
    if (params.supplier_ids) {
      getSupplierByCode(params.supplier_ids.toString()).then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, formBaseFilter]);

  useEffect(() => {
    (async () => {
      if (history.location.pathname !== PurchaseOrderTabUrl.RETURN) {
        return;
      }
      if (paramsArray.length < (prevArray?.length || 0)) {
        let newParams = transformParamsToObject(paramsArray);
        setParams(newParams);
        await history.push(`${history.location.pathname}?${generateQuery(newParams)}`);
      }
    })();
  }, [paramsArray, history, prevArray, setParams]);

  useEffect(() => {
    if (history.location.pathname !== PurchaseOrderTabUrl.RETURN) {
      return;
    }
    const formatted = formatFieldTag(params, {
      ...filterPOReturnFieldsMapping,
    });
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case POReturnFilterField.supplier_ids:
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
        case POReturnFilterField.store_ids:
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
        case POReturnFilterField.merchandisers:
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
        case POReturnFilterField.info:
          return { ...item, valueName: item.valueId.toString() };
        default:
          return item;
      }
    });
    setParamsArray(transformParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, JSON.stringify(allStore), JSON.stringify(allSupplier)]);

  const onBaseFinish = (values: PurchaseOrderReturnQuery) => {
    const valuesForm = {
      ...values,
      info: values.info && values.info.trim(),
    };
    onFilter && onFilter(valuesForm);
  };

  const onRemoveStatus = (index: number) => {
    remove(index);
  };

  return (
    <>
      <div className="base-filter">
        <CustomFilter onMenuClick={() => null} menu={[]}>
          <Form onFinish={onBaseFinish} form={formBaseFilter} layout="inline">
            <POReturnFiltersWrapper>
              <Item name={POReturnFilterField.info} className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tìm kiếm theo mã đơn đặt hàng, mã phiếu trả, mã tham chiếu"
                />
              </Item>
              <Item
                name={POReturnFilterField.store_ids}
                className="stores"
                style={{ minWidth: 250 }}
              >
                <TreeStore
                  form={formBaseFilter}
                  name={POReturnFilterField.store_ids}
                  placeholder="Chọn kho trả hàng"
                  listStore={allStore}
                />
              </Item>
              <Item className="suppliers" style={{ minWidth: 260 }}>
                <SupplierSearchSelect
                  label
                  name={POReturnFilterField.supplier_ids}
                  mode="multiple"
                  help={false}
                  maxTagCount="responsive"
                  supplier_ids={params.supplier_ids}
                />
              </Item>
              <Item name={POReturnFilterField.merchandisers} style={{ minWidth: 280 }}>
                <BaseSelectMerchans
                  mode={"tags"}
                  tagRender={tagRender}
                  merchans={merchans}
                  fetchMerchans={fetchMerchans}
                  isLoadingMerchans={isLoadingMerchans}
                />
              </Item>
              <Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Item>
              <Item>
                <ButtonSetting onClick={openSetting} />
              </Item>
            </POReturnFiltersWrapper>
          </Form>
        </CustomFilter>
        <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
      </div>
    </>
  );
};

export default PurchaseOrderReturnFilter;
