import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select } from "antd";
import CustomDatePicker from "component/custom/date-picker.custom";
import CustomSelect from "component/custom/select.custom";
import { StyledComponent } from "component/filter/warranty.filter.styles";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { StoreResponse } from "model/core/store.model";
import { OrderSearchQuery } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { GetWarrantiesParamModel, WarrantyItemType } from "model/warranty/warranty.model";
import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { haveAccess } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";

type PropTypes = {
  stores: StoreResponse[];
  params: GetWarrantiesParamModel;
  actions: Array<MenuAction>;
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  warrantyTypes: {
    name: string;
    value: WarrantyItemType;
  }[]
};

function WarrantyFilter(props: PropTypes): JSX.Element {
  const { stores, params, actions, onMenuClick, onFilter, onShowColumnSetting, isLoading, warrantyTypes } = props;

  console.log('params', params)
  const loadingFilter = useMemo(() => {
    return !!isLoading;
  }, [isLoading]);
  const [formSearch] = Form.useForm();
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  const initialValues: GetWarrantiesParamModel = useMemo(() => {
    return {
      ...params,
      ids: Array.isArray(params.ids) ? params.ids.map(i => Number(i)) : [Number(params.ids)],
      store_ids: Array.isArray(params.store_ids) ? params.store_ids.map(i => Number(i)) : [Number(params.store_ids)],
      from_created_date: params.from_appointment_date,
      from_appointment_date: params.from_appointment_date,
    };
  }, [params]);

  console.log('initialValues', initialValues)

  const renderTabHeader = () => {};

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const onFinish = useCallback(
    (values) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (stores && stores.length) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = stores.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : [])
        );
      } else {
        newData = stores;
      }
    }

    return newData;
  }, [stores, userReducer.account]);

  return (
    <StyledComponent>
      {renderTabHeader()}
      <div className="warranty-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form form={formSearch} initialValues={initialValues} layout="inline" onFinish={onFinish}>
            <div style={{ width: "100%" }}>
              <Row gutter={12}>
                <Col span={6}>
                  <Form.Item name="store_id">
                    <CustomSelect
                      className="select-with-search"
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Chọn cửa hàng"
                      notFoundContent="Không tìm thấy kết quả">
                      {dataCanAccess.map((item, index) => (
                        <Select.Option key={index} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </CustomSelect>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="ids">
                    <Input type="text" placeholder="ID"/>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="fromDate">
                    <CustomDatePicker
                      placeholder="Ngày tiếp nhận"
                      format={DATE_FORMAT.DDMMYYY}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="toDate">
                    <CustomDatePicker
                      placeholder="Đến ngày"
                      format={DATE_FORMAT.DDMMYYY}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="type">
                    <CustomSelect
                      className="select-with-search"
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Loại"
                      notFoundContent="Không tìm thấy kết quả">
                      {warrantyTypes.map((item, index) => (
                        <Select.Option key={index} value={item.value}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </CustomSelect>
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="buttonGroup">
              <Button type="primary" loading={loadingFilter} htmlType="submit">
                Lọc
              </Button>
              <Button icon={<SettingOutlined />} onClick={onShowColumnSetting} />
            </div>
          </Form>
        </CustomFilter>
      </div>
    </StyledComponent>
  );
}

export default WarrantyFilter;
