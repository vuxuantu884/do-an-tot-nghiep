import moment from "moment";
import {StoreResponse} from "../../../../model/core/store.model";
import {SourceResponse} from "../../../../model/response/order/source.response";
import search from "assets/img/search.svg";
import {
  CustomerGroupModel,
} from "../../../../model/response/customer/customer-group.response";
import {DiscountSearchQuery} from "../../../../model/query/discount.query";
import {MenuAction} from "../../../../component/table/ActionButton";
import {Button, Form, Input, Select, Space, Tag} from "antd";
import React, {useCallback, useState} from "react";
import {StyledComponent} from "./style";
import CustomFilter from "../../../../component/table/custom.filter";
import {checkFixedDate, DATE_FORMAT} from "../../../../utils/DateUtils";
import {SearchVariantField, SearchVariantMapping} from "../../../../model/promotion/promotion-mapping";
import { FilterOutlined } from "@ant-design/icons"

type DiscountFilterProps = {
  params: DiscountSearchQuery;
  actions: Array<MenuAction>;
  listStore?: Array<StoreResponse>;
  listSource?: Array<SourceResponse>;
  listCustomerCategories?: Array<CustomerGroupModel>;
  // tableLoading: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (value: DiscountSearchQuery | Object) => void;
  onClearFilter?: () => void;
}

const statuses = [
  {
    code: 'ACTIVE',
    value: 'Đang áp dụng',
  },
  {
    code: 'DISABLED',
    value: 'Tạm ngưng',
  },
  {
    code: 'DRAFT',
    value: 'Chờ áp dụng' ,
  },
  {
    code: 'CANCELLED',
    value: 'Đã huỷ',
  },

]

const discount_methods = [
  {
    code: 'total_amount',
    value: 'Theo tổng giá trị đơn hàng',
  },
  {
    code: 'specific_item',
    value: 'Theo từng sản phẩm',
  },
  {
    code: 'parity',
    value: 'Đồng giá',
  },
  {
    code: 'quantity',
    value: 'Theo số lượng sản phẩm',
  },
  {
    code: 'item_category',
    value: 'Theo từng loại sản phẩm',
  },
]

const {Item} = Form;
const {Option} = Select;

const DiscountFilter: React.FC<DiscountFilterProps> = (props: DiscountFilterProps) => {
  const [formAvd] = Form.useForm();
  const {
    params,
    actions,
    listStore,
    listSource,
    listCustomerCategories,
    // tableLoading,
    onMenuClick,
    onFilter,
  } = props;

  // useState
  // const [visible, setVisible] = useState(false);
  let [advanceFilters,] = useState<any>({});
  const [form] = Form.useForm();

  // useCallback
  const onFinish = useCallback((values: DiscountSearchQuery) => {
    onFilter && onFilter(values);
  }, [onFilter])

  const openFilter = useCallback(() => {
    // setVisible(true);
  }, [])

  const onActionClick = useCallback((index) => {
    onMenuClick && onMenuClick(index);
  }, [onMenuClick])


  const resetField = useCallback((field) => {
    formAvd.setFieldsValue({
      ...formAvd.getFieldsValue(true),
      [field]: undefined,
    })
    formAvd.submit();
  }, [formAvd])

  return (
    <StyledComponent>
      <div className="discount-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} initialValues={params} layout="inline" form={form}>
            <Item name="query" className="search">
              <Input
                prefix={<img src={search} alt=""/>}
                placeholder="Tìm kiếm theo mã, tên chương trình"
                onBlur={(e) => {form.setFieldsValue({query: e.target.value?.trim() || ''})}}
              />
            </Item>
            <Item name="state" >
              <Select
                style={{minWidth: "200px"}}
                optionFilterProp="children"
                // mode="multiple"
                placeholder="Chọn trạng thái"
                allowClear={true}
              >
                {statuses?.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button icon={<FilterOutlined />} onClick={openFilter}>Thêm bộ lọc</Button>
            </Item>
          </Form>
        </CustomFilter>
        <FilterList
          filters={advanceFilters}
          resetField={resetField}
          listStore={listStore}
          listSource={listSource}
          listCustomerCategories={listCustomerCategories}
        />
        {/*<BaseFilter*/}
        {/*  visible={visible}*/}
        {/*  onClearFilter={onClearFilterClick}*/}
        {/*  onFilter={onFilterClick}*/}
        {/*  onCancel={onCancelFilter}*/}
        {/*  width={500}*/}
        {/*>*/}
        {/*  <Form*/}
        {/*    onFinish={onFinishAvd}*/}
        {/*    form={formAvd}*/}
        {/*    initialValues={params}*/}
        {/*    layout="vertical"*/}
        {/*  >*/}
        {/*    <Space*/}
        {/*      className="po-filter"*/}
        {/*      direction="vertical"*/}
        {/*      style={{width: "100%"}}*/}
        {/*    >*/}
        {/*      {Object.keys(SearchVariantMapping).map((key) => {*/}
        {/*        let component: any = null;*/}
        {/*        switch (key) {*/}
        {/*          case SearchVariantField.created_date:*/}
        {/*            const from = params.from_created_date;*/}
        {/*            const to = params.to_created_date;*/}
        {/*            component = <CustomRangePicker value={[from, to]}/>;*/}
        {/*            break;*/}
        {/*          case SearchVariantField.status:*/}
        {/*            component = (*/}
        {/*              <Select*/}
        {/*                optionFilterProp="children"*/}
        {/*                mode="multiple"*/}
        {/*                placeholder="Chọn 1 hoặc nhiều trạng thái"*/}
        {/*                onFocus={() => formAvd.setFieldsValue({*/}
        {/*                  ...formAvd.getFieldsValue(true),*/}
        {/*                  status: undefined,*/}
        {/*                })}*/}
        {/*              >*/}
        {/*                <Option value="">Tất cả trạng thái</Option>*/}
        {/*                {statuses?.map((item) => (*/}
        {/*                  <Option key={item.code} value={item.code}>*/}
        {/*                    {item.value}*/}
        {/*                  </Option>*/}
        {/*                ))}*/}
        {/*              </Select>*/}
        {/*            );*/}
        {/*            break;*/}
        {/*          case SearchVariantField.discount_method:*/}
        {/*            component = (*/}
        {/*              <Select*/}
        {/*                optionFilterProp="children"*/}
        {/*                mode="multiple"*/}
        {/*                placeholder="Chọn 1 hoặc nhiều phương thức"*/}
        {/*                onFocus={() => formAvd.setFieldsValue({*/}
        {/*                  ...formAvd.getFieldsValue(true),*/}
        {/*                  discount_method: undefined,*/}
        {/*                })}*/}
        {/*              >*/}
        {/*                <Option value="">Tất cả phương thức</Option>*/}
        {/*                {discount_methods?.map((item) => (*/}
        {/*                  <Option key={item.code} value={item.code}>*/}
        {/*                    {item.value}*/}
        {/*                  </Option>*/}
        {/*                ))}*/}
        {/*              </Select>*/}
        {/*            );*/}
        {/*            break;*/}
        {/*          case SearchVariantField.applied_shop:*/}
        {/*            component = (*/}
        {/*              <Select*/}
        {/*                optionFilterProp="children"*/}
        {/*                mode="multiple"*/}
        {/*                placeholder="Chọn 1 hoặc nhiều cửa hàng"*/}
        {/*                onFocus={() => formAvd.setFieldsValue({*/}
        {/*                  ...formAvd.getFieldsValue(true),*/}
        {/*                  applied_shop: undefined,*/}
        {/*                })}*/}
        {/*              >*/}
        {/*                <Option value="">Tất cả cửa hàng</Option>*/}
        {/*                {listStore?.map((item) => (*/}
        {/*                  <Option key={item.id} value={item.id}>*/}
        {/*                    {item.name}*/}
        {/*                  </Option>*/}
        {/*                ))}*/}
        {/*              </Select>*/}
        {/*            );*/}
        {/*            break;*/}
        {/*          case SearchVariantField.applied_source:*/}
        {/*            component = (*/}
        {/*              <Select*/}
        {/*                optionFilterProp="children"*/}
        {/*                mode="multiple"*/}
        {/*                placeholder="Chọn 1 hoặc nhiều kênh bán hàng"*/}
        {/*                onFocus={() => formAvd.setFieldsValue({*/}
        {/*                  ...formAvd.getFieldsValue(true),*/}
        {/*                  applied_source: undefined,*/}
        {/*                })}*/}
        {/*              >*/}
        {/*                <Option value="">Tất cả kênh bán hàng</Option>*/}
        {/*                {listSource?.map((item) => (*/}
        {/*                  <Option key={item.id} value={item.id}>*/}
        {/*                    {item.name}*/}
        {/*                  </Option>*/}
        {/*                ))}*/}
        {/*              </Select>*/}
        {/*            );*/}
        {/*            break;*/}
        {/*          case SearchVariantField.customer_category:*/}
        {/*            component = (*/}
        {/*              <Select*/}
        {/*                optionFilterProp="children"*/}
        {/*                mode="multiple"*/}
        {/*                placeholder="Chọn 1 hoặc nhiều đối tượng khách hàng"*/}
        {/*                onFocus={() => formAvd.setFieldsValue({*/}
        {/*                  ...formAvd.getFieldsValue(true),*/}
        {/*                  customer_category: undefined,*/}
        {/*                })}*/}
        {/*              >*/}
        {/*                <Option value="">Tất cả kênh bán hàng</Option>*/}
        {/*                {listCustomerCategories?.map((item) => (*/}
        {/*                  <Option key={item.id} value={item.id}>*/}
        {/*                    {item.name}*/}
        {/*                  </Option>*/}
        {/*                ))}*/}
        {/*              </Select>*/}
        {/*            );*/}
        {/*            break;*/}
        {/*        }*/}
        {/*        return (*/}
        {/*          <Collapse key={key}>*/}
        {/*            <Collapse.Panel*/}
        {/*              key="1"*/}
        {/*              header={*/}
        {/*                <span>{SearchVariantMapping[key].toUpperCase()}</span>*/}
        {/*              }*/}
        {/*            >*/}
        {/*              <Item name={key}>{component}</Item>*/}
        {/*            </Collapse.Panel>*/}
        {/*          </Collapse>*/}
        {/*        );*/}
        {/*      })*/}
        {/*      }*/}
        {/*    </Space>*/}
        {/*  </Form>*/}
        {/*</BaseFilter>*/}
      </div>
    </StyledComponent>
  )
}

const FilterList = (({
                       filters,
                       resetField,
                       listStore,
                       listSource,
                       listChannel,
                       listCustomerCategories
                     }: any) => {
  let filterKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{marginBottom: 20}}>
      {filterKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return null;
        if (!SearchVariantMapping[filterKey]) return null;
        switch (filterKey) {
          case SearchVariantField.created_date:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate) renderTxt = `Ngày tạo : ${fixedDate}`;
            else renderTxt = `Ngày tạo : ${formatedFrom} - ${formatedTo}`;
            break;
          case SearchVariantField.status:
            const selectedStatus = value.map((v: string) => statuses.find(status => status.code === v)?.value);
            renderTxt = `${SearchVariantMapping[filterKey]} : ${selectedStatus}`;
            break;
          case SearchVariantField.discount_method:
            const selectedMethods = value.map((v: string) => discount_methods.find(method => method.code === v)?.value);
            renderTxt = `${SearchVariantMapping[filterKey]} : ${selectedMethods}`;
            break;
          case SearchVariantField.applied_shop:
            const selectedShops = value.map((v: string) => listStore.find((store: { id: string; }) => store.id === v)?.name);
            renderTxt = `${SearchVariantMapping[filterKey]} : ${selectedShops}`;
            break;
          case SearchVariantField.applied_source:
            const selectedSources = value.map((v: string) => listSource.find((source: { id: string; }) => source.id === v)?.name);
            renderTxt = `${SearchVariantMapping[filterKey]} : ${selectedSources}`;
            break;
          case SearchVariantField.customer_category:
            const selectedCusCategories = value.map((v: string) => listCustomerCategories.find((c: { id: string; }) => c.id === v)?.name);
            renderTxt = `${SearchVariantMapping[filterKey]} : ${selectedCusCategories}`;
            break;

        }
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}

    </Space>
  )
})
export default DiscountFilter;
