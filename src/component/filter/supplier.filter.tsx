import { Button, Form, Input, Select } from "antd";
import "assets/css/custom-filter.scss";
import search from "assets/img/search.svg";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
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
import {strForSearch} from "../../utils/StringUtils";
import {callApiNative} from "../../utils/ApiUtils";
import {searchAccountPublicApi} from "../../service/accounts/account.service";
import BaseSelectPaging from "../base/BaseSelect/BaseSelectPaging";
import {AccountPublicSearchQuery, AccountResponse} from "../../model/account/account.model";

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
  const [isSearchingMerchan, setIsSearchingMerchan] = React.useState(false);
  const [merchandiser, setMerchandiser] = useState<PageResponse<AccountResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
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

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
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

  const fetchMerchandisers = async (query: AccountPublicSearchQuery) => {
    setIsSearchingMerchan(true)
    try {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        searchAccountPublicApi,
        { ...merchandiser.metadata, ...query  }
      );
      setMerchandiser(response);
      setIsSearchingMerchan(false)
    }catch (err) {
      console.error(err)
    }

  }

  useEffectOnce(() => {
    dispatch(getCollectionRequestAction({ ...params, limit: collections.metadata.limit }, onGetSuccess));
    fetchMerchandisers({...merchandiser.metadata})
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
          <Form.Item name="condition" style={{ flex: 1 }} shouldUpdate={(pre, cur) => pre.condition !== cur.condition}>
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo tên, mã, số điện thoại nhà cung cấp"
              defaultValue={formAdvance.getFieldValue('condition')}
              allowClear
            />
          </Form.Item>

          <Form.Item name="pics" style={{ width: 200 }}>
            <BaseSelectPaging
              loading={isSearchingMerchan}
              data={merchandiser.items}
              metadata={merchandiser.metadata}
              fetchData={fetchMerchandisers}
              renderItem={(item) => <Option key={item.id} value={item.code}>{item.code} - {item.full_name}</Option>}
              placeholder={"Chọn Merchandiser"}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => setVisible(true)}>Thêm bộ lọc</Button>
          </Form.Item>
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
            <Select
              allowClear
              showSearch
              showArrow
              placeholder="Chọn khu vực"
              optionFilterProp="children"
              filterOption={(input: String, option: any) => {
                if (!option.props.value) return false;
                return strForSearch(option.props.children.toString()).includes(strForSearch(input));
              }}
            >
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
