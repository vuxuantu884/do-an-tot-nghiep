import {
  Card,
  AutoComplete,
  Input,
  Form,
  Button,
  Avatar,
  Divider,
  Row,
  Col,
} from "antd";

import { SearchOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AiOutlineClose, AiOutlinePlusCircle } from "react-icons/ai";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";
import SupplierItem from "./supplier-item";
import avatarDefault from "assets/icon/user.svg";

const POSupplierForm = () => {
  const [data, setData] = useState<Array<SupplierResponse>>([]);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const onResult = useCallback((result: PageResponse<SupplierResponse>) => {
    setData(result.items);
  }, []);
  const onSupplierSearchChange = useCallback(
    (value) => {
      if (value.length >= 3) {
        dispatch(SupplierSearchAction({ info: value }, onResult));
      } else {
        setData([]);
      }
    },
    [dispatch, onResult]
  );
  const onSelect = useCallback(
    (value: string) => {
      let index = data.findIndex((item) => item.id.toString() === value);
      form.setFieldsValue({
        supplier_id: value,
        supplier: data[index],
      });
      setData([]);
    },
    [data, form]
  );
  const onDeleteSupplier = useCallback(() => {
    form.setFieldsValue({
      supplier_id: null,
      supplier: null,
    });
  }, [form]);
  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: SupplierResponse, index: number) => {
      options.push({
        label: <SupplierItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [data]);
  return (
    <Form form={form} name="supplier">
      <Card
        className="po-form"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN NHÀ CUNG CẤP</span>
          </div>
        }
      >
        <Form.Item
          shouldUpdate={(prevValues, curValues) =>
            prevValues.supplier_id !== curValues.supplier_id
          }
        >
          {({ getFieldValue }) => {
            let supplier_id = getFieldValue("supplier_id");
            let supplier: SupplierResponse = getFieldValue("supplier");
            return supplier_id ? (
              <div className="supplier-container">
                <div className="padding-10 supplier-container-info">
                  <Avatar src={avatarDefault} />
                  <div className="supplier-container-info-right">
                    <div className="rs-name">{supplier.name}</div>
                    <div className="rs-money">
                      Công nợ hiện tại: 0
                      <Button
                        onClick={onDeleteSupplier}
                        className="rs-delete"
                        icon={<AiOutlineClose />}
                      />
                    </div>
                  </div>
                </div>
                <Divider style={{ margin: 0 }} />
                <div className="supplier-container-address">
                  <Row className="margin-top-10" gutter={24}>
                    <Col span={4}>
                      <span className="su-title">Mã nhà cung cấp</span>
                    </Col>
                    <Col span={20}>
                      <span>{supplier.code}</span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={24}>
                    <Col span={4}>
                      <span className="su-title">Địa chỉ</span>
                    </Col>
                    <Col span={20}>
                      <span>{`${supplier.district_name} ${supplier.city_name} ${supplier.country_name}`}</span>
                    </Col>
                  </Row>
                  <Row className="margin-top-10" gutter={24}>
                    <Col span={4}>
                      <span className="su-title">Số điện thoại</span>
                    </Col>
                    <Col span={20}>
                      <span>{supplier.phone}</span>
                    </Col>
                  </Row>
                </div>
              </div>
            ) : (
              <div className="padding-20">
                <AutoComplete
                  notFoundContent={"Không tìm thấy nhà cung cấp"}
                  onSearch={onSupplierSearchChange}
                  style={{ width: "100%" }}
                  dropdownClassName="supplier"
                  dropdownRender={(menu) => (
                    <div className="dropdown-custom">
                      <Button
                        icon={<AiOutlinePlusCircle size={24} />}
                        className="dropdown-add-new"
                        type="link"
                      >
                        Thêm mới nhà cung cấp
                      </Button>
                      {menu}
                    </div>
                  )}
                  onSelect={onSelect}
                  options={renderResult}
                >
                  <Input
                    placeholder="Tìm hoặc thêm nhà cung cấp... (F4)"
                    className="border-input"
                    prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                  />
                </AutoComplete>
              </div>
            );
          }}
        </Form.Item>
      </Card>
    </Form>
  );
};

export default POSupplierForm;
