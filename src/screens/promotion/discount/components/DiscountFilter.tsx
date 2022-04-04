import moment from "moment";
import { StoreResponse } from "../../../../model/core/store.model";
import { SourceResponse } from "../../../../model/response/order/source.response";
import search from "assets/img/search.svg";
import {
  CustomerGroupModel,
} from "../../../../model/response/customer/customer-group.response";
import { DiscountSearchQuery } from "../../../../model/query/discount.query";
import { MenuAction } from "../../../../component/table/ActionButton";
import { Button, Col, Form, Input, Row, Select, Space, Tag } from "antd";
import React, { useCallback, useState } from "react";
import { StyledComponent } from "./style";
import CustomFilter from "../../../../component/table/custom.filter";
import { checkFixedDate, DATE_FORMAT } from "../../../../utils/DateUtils";
import { SearchVariantField, SearchVariantMapping } from "../../../../model/promotion/promotion-mapping";
import useAuthorization from "hook/useAuthorization";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import BaseFilter from "component/filter/base.filter";
import { FilterOutlined } from "@ant-design/icons";
import CustomRangePicker from "component/filter/component/range-picker.custom";
import TreeStore from "../../../products/inventory/filter/TreeStore";

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
    value: 'Chờ áp dụng',
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

const { Item } = Form;
const { Option } = Select;

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
  const [visible, setVisible] = useState(false);
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [form] = Form.useForm();

  // useCallback
  const onFinish = useCallback((values: DiscountSearchQuery) => {
    onFilter && onFilter(values);
  }, [onFilter])

  const onFinishAvd = useCallback(
    (values: any) => {
      console.log("onFinishAvd: ", values);
      setAdvanceFilters(values);
      if (values.created_date) {
        const [from_created_date, to_created_date] = values.created_date;
        values.from_created_date = values.created_date ? from_created_date : undefined;
        values.to_created_date = values.created_date ? to_created_date : undefined;
      }
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAvd.submit();
  }, [formAvd]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, [])

  const onActionClick = useCallback((index) => {
    onMenuClick && onMenuClick(index);
  }, [onMenuClick])

  const onClearFilterClick = useCallback(() => {
    formAvd.resetFields();
    formAvd.submit();
    setVisible(false);
  }, [formAvd]);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const resetField = useCallback((field) => {
    formAvd.setFieldsValue({
      ...formAvd.getFieldsValue(true),
      [field]: undefined,
    })
    formAvd.submit();
  }, [formAvd])

  const [allowUpdateDiscount] = useAuthorization({ acceptPermissions: [PromoPermistion.UPDATE] })
  return (
    <StyledComponent>
      <div className="discount-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions} actionDisable={!allowUpdateDiscount}>
          <Form onFinish={onFinish} initialValues={params} layout="inline" form={form}>
            <Item name="query" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã, tên chương trình"
                onBlur={(e) => { form.setFieldsValue({ query: e.target.value?.trim() || '' }) }}
              />
            </Item>
            <Item name="state" >
              <Select
                style={{ minWidth: "200px" }}
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
        <BaseFilter
          visible={visible}
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          width={700}
        >
          <Form
            onFinish={onFinishAvd}
            form={formAvd}
            initialValues={params}
            layout="vertical"
          >
            <Row gutter={20}>
              {Object.keys(SearchVariantMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantField.created_date:
                    component = <CustomRangePicker />;
                    break;
                  case SearchVariantField.status:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        placeholder="Chọn 1 hoặc nhiều trạng thái"
                        onFocus={() => formAvd.setFieldsValue({
                          ...formAvd.getFieldsValue(true),
                          status: undefined,
                        })}
                      >
                        <Option value="">Tất cả trạng thái</Option>
                        {statuses?.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.value}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.discount_method:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        placeholder="Chọn 1 hoặc nhiều phương thức"
                        onFocus={() => formAvd.setFieldsValue({
                          ...formAvd.getFieldsValue(true),
                          discount_method: undefined,
                        })}
                      >
                        <Option value="">Tất cả phương thức</Option>
                        {discount_methods?.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.value}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.applied_shop:
                    component = (
                      <TreeStore
                        name="applied_shop"
                        placeholder="Chọn 1 hoặc nhiều cửa hàng"
                        listStore={listStore}
                      />
                    );
                    break;
                  case SearchVariantField.applied_source:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        placeholder="Chọn 1 hoặc nhiều kênh bán hàng"
                        onFocus={() => formAvd.setFieldsValue({
                          ...formAvd.getFieldsValue(true),
                          applied_source: undefined,
                        })}
                      >
                        <Option value="">Tất cả kênh bán hàng</Option>
                        {listSource?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.customer_category:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        placeholder="Chọn 1 hoặc nhiều đối tượng khách hàng"
                        onFocus={() => formAvd.setFieldsValue({
                          ...formAvd.getFieldsValue(true),
                          customer_category: undefined,
                        })}
                      >
                        <Option value="">Tất cả khách hàng</Option>
                        {listCustomerCategories?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                }
                return (
                  <Col span={12}>
                    <p>{SearchVariantMapping[key]}</p>
                    <Item name={key}>{component}</Item>
                  </Col>
                );
              })
              }
            </Row>
          </Form>
        </BaseFilter>
      </div>
    </StyledComponent>
  )
}

const FilterList = (({
  filters,
  resetField,
  listStore,
  listSource,
  listCustomerCategories
}: any) => {
  let filterKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
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
            // eslint-disable-next-line array-callback-return
            if (!Array.isArray(value) || (Array.isArray(value) && value.length === 0)) return;
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
