import { Button, Form, Input, Select } from "antd";
import "assets/css/custom-filter.scss";
import search from "assets/img/search.svg";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { AppConfig } from "config/app.config";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { DistrictResponse } from "model/content/district.model";
import { SupplierQuery } from "model/core/supplier.model";
import React, {memo, useCallback, useEffect, useState} from "react";
import BaseFilter from "./base.filter";
import CustomSelectOne from "./component/select-one.custom";
import SelectSearchPaging from "../custom/select-search/select-search-paging";
import {PageResponse} from "../../model/base/base-metadata.response";
import {CollectionResponse} from "../../model/product/collection.model";
import {getCollectionRequestAction} from "../../domain/actions/product/collection.action";
import {useDispatch} from "react-redux";
import useEffectOnce from "react-use/lib/useEffectOnce";
import BaseFilterResult from "../base/BaseFilterResult";
import {SupplierEnum} from "./interfaces/supplier";
import {formatFieldTag, generateQuery, transformParamsToObject} from "../../utils/AppUtils";
import {useArray} from "../../hook/useArray";
import {useHistory} from "react-router";
import UrlConfig from "../../config/url.config";
import {isEqual} from "lodash";

type SupplierFilterProps = {
  initValue: SupplierQuery;
  params: SupplierQuery & { [key: string]: any };
  setParams: any;
  onFilter?: (values: SupplierQuery) => void;
  supplierStatus?: Array<BaseBootstrapResponse>;
  listSupplierType?: Array<BaseBootstrapResponse>;
  scorecard?: Array<BaseBootstrapResponse>;
  listDistrict?: Array<DistrictResponse>;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
};

const fieldMapping = {
  [SupplierEnum.status]: "Trạng thái",
  [SupplierEnum.merchandiser]: "Merchandiser",
  [SupplierEnum.collection_id]: "Nhóm hàng",
  [SupplierEnum.condition]: "Thông tin LH",
  [SupplierEnum.scorecard]: "Phân cấp",
  [SupplierEnum.district_id]: "Khu vực",
  [SupplierEnum.type]: "Loại",
}

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
  const {array: paramsArray, set: setParamsArray, remove, prevArray} = useArray([])

  // const formRef = createRef<FormInstance>();
  const onFinish = useCallback(
    (values: SupplierQuery) => {
      onFilter && onFilter({...values, condition: values.condition?.trim()});
    },
    [onFilter]
  );
  const getStatusObjFromEnum= () => {
  const statusObj:any = {};
  if (supplierStatus) {
    supplierStatus.forEach(item => {
      statusObj[item.value] = item.name;
    });
  }
  return statusObj;
  }
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvance.submit();
  }, [formAdvance]);
  const onClearFilterAdvanceClick = useCallback(() => {
    formAdvance.setFieldsValue(initValue);
    setVisible(false);
    formAdvance.submit();
  }, [formAdvance, initValue]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
  useEffect(() => {
    if (visible) formAdvance.resetFields();
    formAdvance.setFieldsValue({
      district_id: params.district_id
    });
    setTimeout(() => {
      formAdvance.setFieldsValue({
        merchandiser: params.merchandiser
      });
    })
  }, [formAdvance, listDistrict, params.district_id, visible, params]);

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
    const formatted = formatFieldTag(params, fieldMapping)
    const newParams = formatted.map((item) => {
      switch (item.keyId) {
        case "status":
          return {...item, valueName: item.valueId === "inactive" ? "Ngừng hoạt động" : "Đang hoạt động"}
        case "type":
          return {...item, valueName: item.valueId === "enterprise" ? "Doanh nghiệp" : "Cá nhân"}
        case "condition":
          return {...item, valueName: item.valueId}
        case "merchandiser":
          return {...item, valueName: item.valueId}
        case "district_id":
          const findDistrict = listDistrict?.find(district => +district.id === +item.valueId)
          return {...item, valueName: findDistrict?.name}
        case "scorecard":
          return {...item, valueName: item.valueId}
        case "collection_id":
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
    if(paramsArray.length < (prevArray?.length || 0)) {
      const newParams = transformParamsToObject(paramsArray)
      setParams(newParams)
      history.replace(`${UrlConfig.SUPPLIERS}?${generateQuery(newParams)}`)
    }
  }, [history, prevArray, paramsArray, setParams])

  return (
    <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Form.Item name="condition" style={{ flex: 1 }} shouldUpdate={(pre, cur) => pre.condition !== cur.condition}>
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo tên, mã, số điện thoại nhà cung cấp"
              defaultValue={formAdvance.getFieldValue('condition')}
              allowClear
            />
          </Form.Item>

          <Form.Item name="merchandiser" style={{ width: 200 }}>
            <AccountSearchPaging placeholder="Chọn Merchandiser" mode="multiple" fixedQuery={{department_ids: [AppConfig.WIN_DEPARTMENT]}}/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter}>Thêm bộ lọc</Button>
          </Form.Item>
        </Form>
      </CustomFilter>
      <BaseFilter
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={396}
      >
        <Form
          form={formAdvance}
          onFinish={onFinish}
          //ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Item name="status" label="Trạng thái">
              <CustomSelectOne span={12} data={getStatusObjFromEnum()} />
          </Item>

          <Form.Item label="Thông tin liên hệ" name="condition">
            <Input placeholder="Tên/SDT người liên hệ" />
          </Form.Item>

          <Item label="Khu vực" name="district_id">
            <Select allowClear showSearch placeholder="Chọn khu vực" optionFilterProp="children">
              {listDistrict?.map((item) => (
                <Option key={item.id} value={item.id.toString()}>
                  {item.city_name} - {item.name}
                </Option>
              ))}
            </Select>
          </Item>

          <Item name="scorecard" label="Phân cấp">
            <Select placeholder="Chọn phân cấp" allowClear>
              {scorecard?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>

          <Item name="collection_id" label="Nhóm hàng">
            <SelectSearchPaging
              data={collections.items}
              onSearch={onSearchCollections}
              isLoading={isSearchingCollections}
              defaultValue={params?.collection_id}
              metadata={collections.metadata}
              placeholder="Chọn nhóm hàng"
              optionKeyValue="id"
              optionKeyName="name"
              onSelect={(item) => formAdvance.setFieldsValue({ collection_id: item.value })}
            />
          </Item>

           <Form.Item name="type" label="Loại">
            <Select
              allowClear
              placeholder="Loại nhà cung cấp"
            >
              {listSupplierType?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </BaseFilter>
      <BaseFilterResult data={paramsArray} onClose={remove}/>
    </div>
  );
};

export default memo(SupplierFilter, isEqual);
