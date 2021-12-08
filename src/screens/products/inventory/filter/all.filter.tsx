import { FilterOutlined } from "@ant-design/icons";
import { Button, Collapse, Form, Input, Space, Tag} from "antd";
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
  InventoryQueryField
} from "model/inventory/field";
import React, { useCallback, useEffect, useState } from "react"; 
import BaseFilter from "component/filter/base.filter";
import NumberInputRange from "component/filter/component/number-input-range";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { convertCategory } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { getCategoryRequestAction } from "domain/actions/product/category.action";

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


const {Item} = Form;
const {Panel} = Collapse; 

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
  const [tempAdvanceFilters, setTempAdvanceFilters] = useState<any>({});
  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);

  const FilterList = ({filters, resetField}: any) => {
    let filtersKeys = Object.keys(filters);
    let renderTxt: any = null;
    
    return (
      <div>
        {filtersKeys.map((filterKey) => {
          
          let value = filters[filterKey];
          
          if (!value) return null;
          if (!AllInventoryMappingField[filterKey]) return null; 
          renderTxt = `${AllInventoryMappingField[filterKey]} : ${value[0]} ~ ${value[1]}`;

          if (filterKey === AvdAllFilter.category) {
            const category = listCategory.find(e=>e.id === value)?.name;
            renderTxt = `${AllInventoryMappingField[filterKey]} : ${category}`;
          }
           
          return (
            <Tag
              onClose={() => resetField(filterKey)}
              key={filterKey}
              className="fade"
              closable
              style={{marginBottom: 20}}
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

  const onResetFilter = useCallback(() => {
    let fields = formAdvanceFilter.getFieldsValue(true);
    for (let key in fields) {
      fields[key] = null;
    }
    formAdvanceFilter.setFieldsValue(fields);
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);

  const resetField = useCallback(
    (field: string) => {
      formBaseFilter.setFieldsValue({
        ...formBaseFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formAdvanceFilter.setFieldsValue({
        ...formAdvanceFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formBaseFilter.submit();
    },
    [formBaseFilter, formAdvanceFilter]
  );

  useEffect(() => {
    setAdvanceFilters({ ...params });
    dispatch(getCategoryRequestAction({}, setDataCategory));
  }, [params, dispatch, setDataCategory]);

  useEffect(() => {
    formBaseFilter.setFieldsValue({...advanceFilters});
    formAdvanceFilter.setFieldsValue({...advanceFilters});
    setTempAdvanceFilters(advanceFilters);
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
          <Item name={InventoryQueryField.store_ids} className="store">
            <CustomSelect
              showSearch
              optionFilterProp="children"
              showArrow
              placeholder="Chọn cửa hàng"
              mode="multiple"
              allowClear
              tagRender={tagRender}
              style={{
                width: 250,
              }}
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
        width={500}
      >
        <Form
          name={`avdHistoryInventory`}
          onFinish={onAdvanceFinish}
          initialValues={{}}
          form={formAdvanceFilter}
        >
          <Space className="po-filter" direction="vertical" style={{width: "100%"}}>
            {Object.keys(AvdAllFilter).map((field) => {
              let component: any = null;
              switch (field) {
                case AvdAllFilter.category:
                  component = (
                    <CustomSelect
                      optionFilterProp="children"
                      showSearch
                      placeholder="Chọn danh mục" 
                    >
                      {listCategory.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id}>
                          {`${item.code} - ${item.name}`}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  );
                  break; 
                default: 
                 component = <NumberInputRange />;
                  break; 
              }

              return (
                <Collapse key={field}>
                  <Panel
                    key="1"
                    className={tempAdvanceFilters[field] ? "active" : ""}
                    header={
                      <span>{AllInventoryMappingField[field]?.toUpperCase()}</span>
                    }
                  >
                    <Item name={field}>
                      {component}
                    </Item>
                  </Panel>
                </Collapse>
              );
            })}
          </Space>
        </Form>
      </BaseFilter>
    </div>
  );
};
export default AllInventoryFilter;
