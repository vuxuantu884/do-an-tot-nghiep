import { Button, Form, Input, Select } from "antd";
import "assets/css/custom-filter.scss";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import { SupplierQuery } from "model/core/supplier.model";
import React, {memo, useEffect, useState} from "react";
import BaseFilter from "./base.filter";
import CustomSelectOne from "./component/select-one.custom";
import {PageResponse} from "../../model/base/base-metadata.response";
import {CollectionResponse} from "../../model/product/collection.model";
import {getCollectionRequestAction} from "../../domain/actions/product/collection.action";
import {useDispatch} from "react-redux";
import useEffectOnce from "react-use/lib/useEffectOnce";
import BaseFilterResult from "../base/BaseFilterResult";
import {FieldMapping, SupplierEnum, SupplierFilterProps} from "./interfaces/supplier";
import {formatFieldTag, generateQuery, transformParamsToObject} from "../../utils/AppUtils";
import {useArray} from "../../hook/useArray";
import {useHistory} from "react-router";
import UrlConfig from "../../config/url.config";
import {isEqual} from "lodash";
import BaseSelectPaging from "../base/BaseSelect/BaseSelectPaging";
import {useFetchMerchans} from "../../hook/useFetchMerchans";
import BaseSelect from "../base/BaseSelect/BaseSelect";
import BaseSelectMerchans from "../base/BaseSelect/BaseSelectMerchans";

const { Item } = Form;
const { Option } = Select;

const SupplierFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const {
    onFilter,
    params,
    initValue,
    listSupplierType,
    supplierStatus,
    scorecard,
    listDistrict,
    actions,
    onMenuClick,
    setParams,
  } = props;
  const dispatch = useDispatch()
  const history = useHistory()
  const [visible, setVisible] = useState(false);
  const [formBasic] = Form.useForm();
  const [formAdvance] = Form.useForm();
  const [collections, setCollections] = useState<PageResponse<CollectionResponse>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [isSearchingCollections, setIsSearchingCollections] = React.useState(false);
  const {fetchMerchans, merchans, isLoadingMerchans} = useFetchMerchans()
  const {array: paramsArray, set: setParamsArray, remove, prevArray} = useArray([])

  const onFinish = (values: SupplierQuery) => {
    onFilter && onFilter({...values, condition: values.condition?.trim()});
  }
  const getStatusObjFromEnum= () => {
  const statusObj:any = {};
  if (supplierStatus) {
    supplierStatus.forEach(item => {
      statusObj[item.value] = item.name;
    });
  }
  return statusObj;
  }
  const onFilterClick = () => {
    setVisible(false);
    formAdvance.submit();
  }
  const onClearFilterAdvanceClick = () => {
    formAdvance.setFieldsValue(initValue);
    setVisible(false);
    formAdvance.submit();
  }

  const onActionClick = (index: number) => {
    onMenuClick && onMenuClick(index);
  }
  useEffect(() => {
    if (visible) formAdvance.resetFields();
    formBasic.setFieldsValue({
      ...formBasic.getFieldsValue(true),
      condition: params.condition,
      pics: params.pics,
    });
    formAdvance.setFieldsValue({
      ...formAdvance.getFieldsValue(true),
      district_id: params.district_id
    });
  }, [formAdvance, formBasic, listDistrict, visible, params]);

  const onGetSuccess = (results: PageResponse<CollectionResponse>) => {
    if (results?.items) {
      setCollections(results);
      setIsSearchingCollections(false);
    }
  };

  useEffectOnce(() => {
    dispatch(getCollectionRequestAction({ ...params, limit: collections.metadata.limit }, onGetSuccess));
  })

  const onSearchCollections = (values: any) => {
    setIsSearchingCollections(true);
    dispatch(
      getCollectionRequestAction({ ...params, ...values, limit: collections.metadata.limit }, onGetSuccess)
    );
  };

  useEffect(() => {
    const formatted = formatFieldTag(params, FieldMapping)
    const newParams = formatted.map((item) => {
      switch (item.keyId) {
        case SupplierEnum.status:
          return {...item, valueName: item.valueId === "inactive" ? "Ngừng hoạt động" : "Đang hoạt động"}
        case SupplierEnum.type:
          return {...item, valueName: item.valueId === "enterprise" ? "Doanh nghiệp" : "Cá nhân"}
        case SupplierEnum.condition:
          return {...item, valueName: item.valueId}
        case SupplierEnum.merchandiser:
          return {...item, valueName: item.valueId.toString()}
        case SupplierEnum.district_id:
          const findDistrict = listDistrict?.find(district => +district.id === +item.valueId)
          return {...item, valueName: findDistrict?.name}
        case SupplierEnum.scorecard:
          return {...item, valueName: item.valueId}
        case SupplierEnum.collection_id:
          const findCollection = collections.items.find(collection => +collection.id === +item.valueId)
          return {...item, valueName: findCollection?.name}
        default:
          return item
      }
    })
    setParamsArray(newParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, JSON.stringify(listDistrict), JSON.stringify(collections), setParamsArray])

  useEffect(() => {
    //Xóa tag
    if(paramsArray.length < (prevArray?.length || 0)) {
      const newParams = transformParamsToObject(paramsArray)
      setParams(newParams)
      history.replace(`${UrlConfig.SUPPLIERS}?${generateQuery(newParams)}`)
    }
  }, [history, prevArray, paramsArray, setParams])

  return (
    <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} form={formBasic} layout="inline">
          <Item name="condition" style={{ flex: 1 }} shouldUpdate={(pre, cur) => pre.condition !== cur.condition}>
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo tên, mã, số điện thoại nhà cung cấp"
              defaultValue={formAdvance.getFieldValue('condition')}
              allowClear
            />
          </Item>
          <Item name="pics" style={{ width: 200 }}>
            <BaseSelectMerchans
              merchans={merchans}
              fetchMerchans={fetchMerchans}
              isLoadingMerchans={isLoadingMerchans}
              mode={"multiple"}
            />
          </Item>
          <Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Item>
          <Item>
            <Button onClick={() => setVisible(true)}>Thêm bộ lọc</Button>
          </Item>
        </Form>
      </CustomFilter>
      <BaseFilter
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={() => setVisible(false)}
        visible={visible}
        width={396}
      >
        <Form
          form={formAdvance}
          onFinish={onFinish}
          initialValues={params}
          layout="vertical"
        >
          <Item name="status" label="Trạng thái">
              <CustomSelectOne span={12} data={getStatusObjFromEnum()} />
          </Item>
          <Item label="Thông tin liên hệ" name="condition">
            <Input placeholder="Tên/SDT người liên hệ" />
          </Item>
          <Item label="Khu vực" name="district_id">
            <BaseSelect
              showSearch
              showArrow
              data={listDistrict}
              renderItem={(item) => (
                <Option key={item.id} value={item.id.toString()}>
                  {item.city_name} - {item.name}
                </Option>
              )}
              placeholder="Chọn khu vực"
            />
          </Item>
          <Item name="scorecard" label="Phân cấp">
            <BaseSelect
              data={scorecard}
              placeholder="Chọn phân cấp"
              renderItem={(item) => (
                <Option key={item.value} value={item.value.toString()}>
                  {item.name}
                </Option>
                )}
            />
          </Item>
          <Item name="collection_id" label="Nhóm hàng">
            <BaseSelectPaging
              loading={isSearchingCollections}
              metadata={collections.metadata}
              data={collections.items}
              renderItem={(item) => <Option key={item.id} value={item.id.toString()}>{item.name}</Option>}
              fetchData={onSearchCollections}
              placeholder="Chọn nhóm hàng"
            />
          </Item>
           <Item name="type" label="Loại">
             <BaseSelect
              data={listSupplierType}
              renderItem={(item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              )}
              placeholder="Loại nhà cung cấp"
             />
          </Item>
        </Form>
      </BaseFilter>
      <BaseFilterResult data={paramsArray} onClose={remove}/>
    </div>
  );
};

export default memo(SupplierFilter, isEqual);
