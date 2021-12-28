import { CloseOutlined, FilterOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Tag } from "antd";
import search from "assets/img/search.svg";
import { FilterWrapper } from "component/container/filter.container";
import CustomSelect from "component/custom/select.custom";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import { StoreResponse } from "model/core/store.model";
import { InventoryQuery } from "model/inventory";
import {
  AllInventoryMappingField,
  AvdAllFilter,
  AvdInventoryFilter,
  InventoryQueryField
} from "model/inventory/field";
import BaseFilter from "component/filter/base.filter";
import React, { useCallback, useEffect, useState } from "react"; 
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { convertCategory, formatCurrency } from "utils/AppUtils";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import TreeStore from "./TreeStore";
import { FormatTextMonney } from "utils/FormatMonney";
import { CollectionResponse } from "model/product/collection.model";
import { getCollectionRequestAction } from "domain/actions/product/collection.action";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { CountryResponse } from "model/content/country.model";
import SelectPaging from "component/custom/SelectPaging";
import { AccountResponse } from "model/account/account.model";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AppConfig } from "config/app.config"; 
import CustomModal from "component/modal/CustomModal";
import { modalActionType } from "model/modal/modal.model";
import FormSaveFilter from "./components/FormSaveFilter";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { createConfigInventoryAction, deleteConfigInventoryAction, getConfigInventoryAction, updateConfigInventoryAction } from "domain/actions/inventory/inventory.action";
import BaseResponse from "base/base.response";
import { FILTER_CONFIG_TYPE } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { primaryColor } from "utils/global-styles/variables";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";

export interface InventoryFilterProps {
  params: InventoryQuery;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: InventoryQuery) => void;
  onClearFilter?: () => void;
  openColumn: () => void;
  onChangeKeySearch: (value: string) => void;
}

const { Item } = Form;

function tagRender(props: any) {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      className="primary-bg"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
    >
      {label}
    </Tag>
  );
}

var isWin = false;
var isDesigner = false;

const AllInventoryFilter: React.FC<InventoryFilterProps> = (
  props: InventoryFilterProps
) => {
  const {
    params,
    listStore,
    onFilter,
    openColumn,
    onChangeKeySearch
  } = props;
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const {account} = userReducer;
  const [lstConfigFilter, setLstConfigFilter] = useState<Array<FilterConfig>>();
  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [showModalSaveFilter, setShowModalSaveFilter] = useState(false);
  const dispatch = useDispatch();
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const [lstCollection, setLstCollection] = useState<Array<CollectionResponse>>([]);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [tagAcitve, setTagActive] = useState<number|null>();
  const [configId, setConfigId] = useState<number>();
  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);
  
  const setDataCollection = useCallback((data: PageResponse<CollectionResponse>) => {
    setLstCollection(data.items);
  }, []);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [wins, setWins] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [designers, setDeisgner] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return false;
      }
      if (isWin) {
        setWins(data);
      }
      if (isDesigner) {
        setDeisgner(data);
      }
    },
    []
  );

  const getAccounts = useCallback((code: string, page: number, designer: boolean, win: boolean) => {
    isDesigner = designer;
    isWin = win;
    dispatch(
      AccountSearchAction(
        { info: code, page: page, department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" },
        setDataAccounts
      )
    );
  }, [dispatch, setDataAccounts]);

  const FilterList = ({ filters, resetField }: any) => {
    let filtersKeys = Object.keys(filters);
    let renderTxt: any = null;

    return (
      <div>
        {filtersKeys.map((filterKey) => {

          let value = filters[filterKey];

          if (!value) return null;
          if (!AllInventoryMappingField[filterKey] || filterKey === AvdAllFilter.to_price) return null; 
          
          switch (filterKey) {
            case AvdAllFilter.category:
            case AvdAllFilter.category_ids:
              let categoryTag = "";
              value.forEach((item: number) => {
                const category = listCategory?.find(e => e.id === item);

                categoryTag = category ? categoryTag + category.name + "; " : categoryTag;
              });
              renderTxt = `${AllInventoryMappingField[filterKey]} : ${categoryTag}`;
              break
              case AvdAllFilter.made_in_ids:
                let madeinTag = "";
                value.forEach((item: number) => {
                  const madein = listCountry?.find(e => e.id === item);
                  
                  madeinTag = madein ? madeinTag + madein.name + "; " : collectionTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${madeinTag}`;
                break
              case AvdAllFilter.collection_codes:
                let collectionTag = "";
                value.forEach((item: string) => {
                  const colection = lstCollection?.find(e => e.code === item);
                  
                  collectionTag = colection ? collectionTag + colection.name + "; " : collectionTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${collectionTag}`;
                break
              case AvdAllFilter.designer_codes:
                let designerTag = "";
                value.forEach((item: string) => {
                  const designer = designers.items?.find(e => e.code === item);
                  
                  designerTag = designer ? designerTag + designer.full_name + "; " : designerTag
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${designerTag}`;
                break
              case AvdAllFilter.merchandiser_codes:
                let merchandiserTag = "";
                value.forEach((item: string) => {
                  const win = wins.items?.find(e => e.code === item);
                  
                  merchandiserTag = win ? merchandiserTag + win.full_name + "; " : merchandiserTag
                });
              renderTxt = `${AllInventoryMappingField[filterKey]} : ${merchandiserTag}`;
              break
            case AvdAllFilter.store_ids:
                let storeTag = "";
                value.forEach((item: number) => {
                  const store = listStore?.find(e => e.id === item);
                  
                  storeTag = store ? storeTag + store.name + "; " : storeTag
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${storeTag}`;
              break
            case AvdAllFilter.from_price:
              renderTxt = `${AllInventoryMappingField[AvdAllFilter.variant_prices]} : Từ ${formatCurrency(advanceFilters.from_price)}`;
              if (advanceFilters.from_price && advanceFilters.to_price) {
                renderTxt = `${AllInventoryMappingField[AvdAllFilter.variant_prices]} : ${formatCurrency(advanceFilters.from_price)} ~ ${formatCurrency(advanceFilters.to_price)}`;
              }
              break
            default:
              break;
          }

          return (
            <Tag
              onClose={() => resetField(filterKey)}
              key={filterKey}
              className="fade"
              closable
              style={{ marginBottom: 20 }}
            >{`${renderTxt}`}</Tag>
          );
        })}
      </div>
    );
  };

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onShowSaveFilter = useCallback(() => {
    setModalAction("create");
    setShowModalSaveFilter(true);
  }, []);

  const getConfigInventory = useCallback(()=>{
    if (account && account.code) {
      dispatch(
        getConfigInventoryAction( 
           account.code,
          (res)=>{
           if (res) {
             if (res.data && res.data.length > 0) {
              const configFilters = res.data.filter(e=>e.type === FILTER_CONFIG_TYPE.FILTER_INVENTORY);
              setLstConfigFilter(configFilters);
             }
           }
          }
        )
      );
    }
  },[account, dispatch])

  const onResult = useCallback((res: BaseResponse<FilterConfig>) =>{
    if (res) {
      showSuccess(`Lưu bộ lọc thành công`);
      setShowModalSaveFilter(false);
      getConfigInventory();
    }
  },[getConfigInventory]);

  const onSaveFilter = useCallback((request: FilterConfigRequest) => {
    if (request) {
      let json_content = JSON.stringify(
        formAdvanceFilter.getFieldsValue(),
        function(k, v) { return v === undefined ? null : v; }
      );;
      request.type = FILTER_CONFIG_TYPE.FILTER_INVENTORY;
      request.json_content = json_content; 
      
      if (request.id && request.id !== null) {
        const config = lstConfigFilter?.find(e=>e.id.toString() === request.id.toString());
        if (lstConfigFilter && config) {
          request.name = config.name;
        }
        dispatch(updateConfigInventoryAction(request,onResult));
      }else{
        dispatch(createConfigInventoryAction(request ,onResult));
      }
    }
    
  }, [dispatch,formAdvanceFilter, onResult, lstConfigFilter]);

  const onBaseFinish = useCallback(
    (values: InventoryQuery) => {
      let data = formBaseFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formBaseFilter, onFilter]
  );

  const onAdvanceFinish = useCallback(
    (values: InventoryQuery) => {
      let data = formAdvanceFilter.getFieldsValue(true);

      onFilter && onFilter(data);
    },
    [formAdvanceFilter, onFilter]
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]); 

  const resetField = useCallback(
    (field: string) => { 
      let newFieldsValue = {
        ...formBaseFilter.getFieldsValue(true),
        [field]: undefined, 
      };
      if (field === AvdAllFilter.from_price) {
        newFieldsValue = {
          ...formBaseFilter.getFieldsValue(true),
          [field]: undefined, 
          [AvdAllFilter.to_price]: undefined, 
        };
      }
      formBaseFilter.setFieldsValue({
        ...newFieldsValue
      });
      formAdvanceFilter.setFieldsValue({
        ...newFieldsValue
      });
      formBaseFilter.submit();
    },
    [formBaseFilter, formAdvanceFilter]
  );

  const customWidth = () => {
		if (window.innerWidth >= 1600) {
			return 1400
		} else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
			return 1000
		} else {
			return 800
		}
	}

  const onSelectFilterConfig = useCallback((index: number, id: number)=>{
      setTagActive(index);
      const filterConfig = lstConfigFilter?.find(e=>e.id === id);
      if (filterConfig) {
        let json_content = JSON.parse(filterConfig.json_content);

        Object.keys(json_content).forEach(function(key, index) {
          if (json_content[key] == null) json_content[key] = undefined;
        }, json_content);
        formAdvanceFilter.setFieldsValue(json_content);
      } 
  },[lstConfigFilter, formAdvanceFilter]);

  const onCloseFilterConfig = useCallback(()=>{
    formAdvanceFilter.resetFields();
    setTagActive(null);
  },[formAdvanceFilter]);

  const onResultDeleteConfig = useCallback((res: BaseResponse<FilterConfig>)=>{
    if (res) {
      showSuccess(`Xóa bộ lọc thành công`);
      setIsShowConfirmDelete(false);
      getConfigInventory();
    }
  },[getConfigInventory])

  const onMenuDeleteConfigFilter =useCallback(()=>{
    if (configId) {
      dispatch(deleteConfigInventoryAction(configId,onResultDeleteConfig));
    }
  },[dispatch ,configId, onResultDeleteConfig]);

  const FilterConfigCom = (props: any)=>{
    return (
      <span style={{marginRight: 20, display: "inline-flex"}}>
          <Tag onClick={(e)=>{
              onSelectFilterConfig(props.index, props.id);  
              }} style={{cursor: "pointer", backgroundColor: tagAcitve === props.index ? primaryColor: '',
                    color: tagAcitve === props.index ? "white": ''}} key={props.index} icon={<StarOutlined />} 
                    closeIcon={<CloseOutlined className={tagAcitve === props.index ? "ant-tag-close-icon" : "ant-tag-close-icon-black"} />} closable={true} onClose={(e)=>{
                      e.preventDefault();
                      setConfigId(props.id); 
                      setIsShowConfirmDelete(true);
                    }}>
              {props.name}  
            </Tag> 
      </span>
    )
  }

  const onResetFilter = useCallback(() => {
    let fields = formAdvanceFilter.getFieldsValue(true);
    for (let key in fields) {
      fields[key] = null;
    }
    formAdvanceFilter.setFieldsValue(fields);
    setVisible(false);
    formAdvanceFilter.submit();
    onCloseFilterConfig();
  }, [formAdvanceFilter, onCloseFilterConfig]);

  useEffect(() => {
    setAdvanceFilters({ ...params });
    dispatch(getCategoryRequestAction({}, setDataCategory));
    dispatch(getCollectionRequestAction({}, setDataCollection));
    dispatch(CountryGetAllAction(setListCountry));
    getAccounts('', 1, true, true); 
    getConfigInventory();
  }, [params, dispatch,getAccounts,getConfigInventory, setDataCategory, setDataCollection]);

  useEffect(() => {
    formBaseFilter.setFieldsValue({...advanceFilters});
    formAdvanceFilter.setFieldsValue({...advanceFilters});
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);


  return (
      <div className="inventory-filter">
        <Form
          onFinish={onBaseFinish}
          initialValues={advanceFilters}
          form={formBaseFilter}
          name={"baseInventory"}
          layout="inline"
        >
          <FilterWrapper>
            <Item name="info" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                style={{width: "100%"}}
                placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
                onChange={(e)=>{onChangeKeySearch(e.target.value)}}
              />
            </Item>
            <Item name={InventoryQueryField.store_ids} className="store" style={{ minWidth: 250 }}>
              <TreeStore
                form={formBaseFilter}
                name={InventoryQueryField.store_ids}
                placeholder="Chọn cửa hàng"
                listStore={listStore}
            />
            </Item>  
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
                <Button icon={<FilterOutlined />} onClick={openFilter}>
                  Thêm bộ lọc
                </Button>
            </Item>
            <Item>
              <ButtonSetting onClick={openColumn} />
            </Item>
          </FilterWrapper>
        </Form>
        <FilterList filters={advanceFilters} resetField={resetField} />
        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={customWidth()}
          className="order-filter-drawer"
          allowSave={true}
          onSaveFilter={onShowSaveFilter}
        >
          <Form
            name={`avdHistoryInventory`}
            onFinish={onAdvanceFinish}
            layout="vertical"
            initialValues={{}}
            form={formAdvanceFilter} 
          >
              {/* filters tag */}
              {
                (lstConfigFilter && lstConfigFilter.length > 0) && 
                <Row>
                  <Item>
                    <Col span={24} className="tag-filter">
                      {
                        lstConfigFilter?.map((e, index)=>{
                          return <FilterConfigCom id={e.id} index={index} name={e.name} />
                        })
                      }
                    </Col>
                  </Item>
               </Row>
              }
              <Row gutter={25}>
                <Col span={16}>
                  <Item name={AvdInventoryFilter.info} className="search">
                    <Input
                      prefix={<img src={search} alt="" />}
                      style={{width: "100%"}}
                      placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
                    />
                  </Item>
                </Col>
                <Col span={8}>
                  <Item name={AvdInventoryFilter.store_ids} className="store">
                    <CustomSelect
                      showSearch
                      optionFilterProp="children"
                      showArrow
                      placeholder="Chọn cửa hàng"
                      mode="multiple"
                      allowClear
                      tagRender={tagRender} 
                      notFoundContent="Không tìm thấy kết quả"
                      maxTagCount="responsive" 
                    >
                      {listStore?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>  
                </Col> 
              </Row>
              <Row gutter={25}>
                <Col span={8}>
                  <Item name={AvdInventoryFilter.made_in_ids} label="Xuất xứ">
                    <CustomSelect
                        showSearch
                        optionFilterProp="children"
                        showArrow
                        placeholder="Chọn xuất xứ"
                        mode="multiple"
                        allowClear
                        tagRender={tagRender} 
                        notFoundContent="Không tìm thấy kết quả"
                        maxTagCount="responsive" 
                      >
                        {listCountry?.map((item) => (
                          <CustomSelect.Option key={item.id} value={item.id}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8}>
                  <Item name={AvdInventoryFilter.designer_codes} label="Nhà thiết kế">
                    <SelectPaging
                      metadata={designers.metadata}
                      placeholder="Chọn nhà thiết kế"
                      showSearch={false}
                      showArrow
                      allowClear
                      tagRender={tagRender} 
                      mode="multiple"
                      maxTagCount="responsive" 
                      searchPlaceholder="Tìm kiếm nhân viên"
                      onPageChange={(key, page) => getAccounts(key, page, true, false)}
                      onSearch={(key) => getAccounts(key, 1, true, false)}
                    >
                      {designers.items.map((item) => (
                        <SelectPaging.Option key={item.code} value={item.code}>
                          {`${item.code} - ${item.full_name}`}
                        </SelectPaging.Option>
                      ))}
                    </SelectPaging>
                  </Item>  
                </Col> 
                <Col span={8}>
                  <Item name={AvdInventoryFilter.merchandiser_codes} label="Merchandiser">
                    <SelectPaging
                          metadata={wins.metadata}
                          placeholder="Chọn Merchandiser"
                          showSearch={false}
                          showArrow
                          allowClear
                          tagRender={tagRender} 
                          mode="multiple"
                          maxTagCount="responsive" 
                          searchPlaceholder="Tìm kiếm nhân viên"
                          onPageChange={(key, page) => getAccounts(key, page, false, true)}
                          onSearch={(key) => getAccounts(key, 1, false, true)}
                        >
                          {wins.items?.map((item) => (
                            <SelectPaging.Option key={item.id} value={item.code}>
                             {`${item.code} - ${item.full_name}`}
                            </SelectPaging.Option>
                          ))}
                      </SelectPaging>
                  </Item>  
                </Col> 
              </Row>
              <Row gutter={25}>
              <Col span={8}>
                  <Item name={AvdInventoryFilter.collection_codes} label="Nhóm hàng">
                      <CustomSelect
                          showSearch
                          optionFilterProp="children"
                          showArrow
                          placeholder="Chọn nhóm hàng"
                          mode="multiple"
                          allowClear
                          tagRender={tagRender} 
                          notFoundContent="Không tìm thấy kết quả"
                          maxTagCount="responsive" 
                        >
                          {lstCollection?.map((item) => (
                            <CustomSelect.Option key={item.id} value={item.code}>
                              {item.name}
                            </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                  </Item>
                </Col>
                <Col span={8}>
                  <Item name={AvdInventoryFilter.category_ids} label="Danh mục">
                    <CustomSelect
                          showSearch
                          optionFilterProp="children"
                          showArrow
                          placeholder="Chọn danh mục"
                          mode="multiple"
                          allowClear
                          tagRender={tagRender} 
                          notFoundContent="Không tìm thấy kết quả"
                          maxTagCount="responsive" 
                        >
                          {listCategory?.map((item) => (
                            <CustomSelect.Option key={item.id} value={item.id}>
                              {item.name}
                            </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                  </Item>  
                </Col> 
                <Col span={8}> 
                    <Row className="price">
                      <Col span={24}>
                      <Item label="Giá bán">
                        <Input.Group compact>
                          <Item hidden={true} name="variant_prices">
                          </Item>
                          <Item name="from_price" style={{ width: '45%', textAlign: 'center' }}>
                            <InputNumber
                              className="price_min"
                              placeholder="Từ"
                              formatter={value => FormatTextMonney(value ? parseInt(value) : 0)}
                              min="0"
                              max="100000000"
                            />
                          </Item>
                          <div
                            className="site-input-split"
                          >~</div>
                          <Item name="to_price" style={{ width: '45%', textAlign: 'center' }}>
                            <InputNumber
                              className="site-input-right price_max"
                              placeholder="Đến"
                              formatter={value => FormatTextMonney(value ? parseInt(value) : 0)}
                              min="0"
                              max="1000000000"
                            />
                          </Item>
                        </Input.Group>
                    </Item>  
                      </Col>
                    </Row> 
                </Col>                       
              </Row>
          </Form>
        </BaseFilter>
        <CustomModal
          createText="Lưu lại"
          updateText="Lưu lại"
          visible={showModalSaveFilter}
          onCreate={(formValues)=>{onSaveFilter(formValues)}}
          onEdit={()=>{}}
          onDelete={()=>{}}
          onCancel={() => setShowModalSaveFilter(false)}
          modalAction={modalAction}
          lstConfigFilter={lstConfigFilter}
          componentForm={FormSaveFilter}
          formItem={null}
          modalTypeText="bộ lọc"
        />
        <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          onOk={onMenuDeleteConfigFilter}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Xác nhận"
          subTitle={"Bạn có chắc muốn xóa bộ lọc này?"}
        />
      </div>
  );
};
export default AllInventoryFilter;
