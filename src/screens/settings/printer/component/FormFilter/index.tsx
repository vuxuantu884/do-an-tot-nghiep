import { Col, Form, Input, Row, Select } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import CustomSelect from "component/custom/select.custom";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyledComponent } from "./styles";

type PropType = {
  isCanEditFormHeader: boolean;
  isPagePrinterDetail: boolean;
};

type StoreType = {
  id: number;
  name: string;
}[];

const FormFilter: React.FC<PropType> = (props: PropType) => {
  const store_id_allShops = -1;
  const { isCanEditFormHeader, isPagePrinterDetail } = props;
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const [listStores, setListStores] = useState<StoreType>([]);
  const sprintConfigure = {
    listPrinterTypes: bootstrapReducer.data?.print_type,
    listStores: listStores,
    listPrinterSizes: bootstrapReducer.data?.print_size,
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((response: StoreResponse[]) => {
        console.log("response", response);
        setListStores(response);
      })
    );
  }, [dispatch]);
  return (
    <StyledComponent>
      {isPagePrinterDetail && (
        <React.Fragment>
          <Form.Item name="company" hidden>
            <Input type="text" />
          </Form.Item>
          <Form.Item name="company_id" hidden>
            <Input type="text" />
          </Form.Item>
        </React.Fragment>
      )}
      <Row gutter={20} className="sectionFilter">
        <Col span={5}>
          <Form.Item
            name="name"
            label="Tên mẫu in:"
            rules={
              isPagePrinterDetail
                ? [{ required: true, message: "Vui lòng nhập tên mẫu in" }]
                : undefined
            }
          >
            <Input
              type="text"
              disabled={!isCanEditFormHeader}
              placeholder="Nhập tên mẫu in"
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item
            name="type"
            label="Chọn mẫu in:"
            rules={
              isPagePrinterDetail
                ? [{ required: true, message: "Vui lòng chọn mẫu in" }]
                : undefined
            }
          >
            <CustomSelect
              placeholder="Chọn mẫu in"
              allowClear
              showSearch
              optionFilterProp="children"
              disabled={!isCanEditFormHeader}
            >
              {sprintConfigure.listPrinterTypes &&
                sprintConfigure.listPrinterTypes.map((single, index) => {
                  return (
                    <Select.Option value={single.value} key={index}>
                      {single.name}
                    </Select.Option>
                  );
                })}
            </CustomSelect>
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item
            name="store_id"
            label="Chọn chi nhánh áp dụng:"
            rules={
              isPagePrinterDetail
                ? [
                    {
                      required: true,
                      message: "Vui lòng chọn chi nhánh áp dụng",
                    },
                  ]
                : undefined
            }
          >
            <CustomSelect
              placeholder="Chọn chi nhánh áp dụng:"
              allowClear
              showSearch
              optionFilterProp="children"
              disabled={!isCanEditFormHeader}
            >
              <Select.Option value={store_id_allShops}>
                Tất cả cửa hàng
              </Select.Option>
              {sprintConfigure.listStores &&
                sprintConfigure.listStores.map((single, index) => {
                  // console.log("single", single);
                  return (
                    <Select.Option value={single.id} key={index}>
                      {single.name}
                    </Select.Option>
                  );
                })}
            </CustomSelect>
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item
            name="print_size"
            label="Chọn khổ in:"
            rules={
              isPagePrinterDetail
                ? [{ required: true, message: "Vui lòng chọn khổ in" }]
                : undefined
            }
          >
            <CustomSelect
              placeholder="Chọn khổ in"
              allowClear
              showSearch
              disabled={!isCanEditFormHeader}
            >
              {sprintConfigure.listPrinterSizes &&
                sprintConfigure.listPrinterSizes.map((single, index) => {
                  return (
                    <Select.Option value={single.value} key={index}>
                      {single.name}
                    </Select.Option>
                  );
                })}
            </CustomSelect>
          </Form.Item>
        </Col>
        <Col span={4} className="columnActive">
          <Form.Item name="is_default" valuePropName="checked">
            <Checkbox disabled={!isCanEditFormHeader}>Áp dụng</Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </StyledComponent>
  );
};

export default FormFilter;
