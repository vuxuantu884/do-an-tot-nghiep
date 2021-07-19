//#region Import
import {
  UserOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Form,
  Checkbox,
  Space,
  AutoComplete,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import SupplierInfo from "./supplier-info";
import PurchaseItem from "./purchase-item";
import PurchaseInfo from "./purchase-info";
import { SupplierQuery, SupplierResponse } from "model/core/supplier.model";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";

const initSupplierQuery: SupplierQuery = {
  limit: 10,
  page: 1,
};

const CreatePO = () => {
  //#region state
  const dispatch = useDispatch();
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);

  const setDataSupplier = useCallback(
    (data: PageResponse<SupplierResponse>) => {
      setListSupplier(data.items);
    },
    []
  );
  const OptionRenderAutocomplete = (item: SupplierResponse) => {
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100">
          {/* <img src={imgdefault} alt="anh" placeholder={imgdefault} /> */}
          <div className="rs-info w-100">
            <span className="text">
              {item.name} - {item.phone}
            </span>
          </div>
        </div>
      </div>
    );
  };
  const supplierOptionAutocomplete = useMemo(() => {
    let options: any[] = [];
    listSupplier.forEach((item: SupplierResponse, index: number) => {
      options.push({
        label: OptionRenderAutocomplete(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [listSupplier]);

  const onChangeSearchSupplier = (val: string) => {
    initSupplierQuery.info = val;

    dispatch(SupplierSearchAction(initSupplierQuery, setDataSupplier));
  };
  useEffect(() => {}, []);

  return (
    <div className="orders">
      <Form layout="vertical">
        <Row gutter={20}>
          {/* Left Side */}
          <Col md={18}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  Nhà cung cấp
                </Space>
              }
            >
              <div className="padding-20">
                <AutoComplete
                  notFoundContent={"Không tìm thấy thông tin nhà cung cấp"}
                  dropdownClassName="search-layout dropdown-search-header"
                  className="w-100"
                  style={{ width: "100%" }}
                  onChange={onChangeSearchSupplier}
                  dataSource={listSupplier}
                  options={supplierOptionAutocomplete}
                >
                  <Input
                    placeholder="Tìm hoặc thêm nhà cung cấp"
                    className="border-input"
                    prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                  />
                </AutoComplete>
              </div>

              <SupplierInfo />
            </Card>
            <Card
              className="margin-top-20"
              title={
                <Space>
                  <UnorderedListOutlined />
                  Sản phẩm
                </Space>
              }
              extra={
                <Space size={20}>
                  <Checkbox>Tách dòng</Checkbox>
                </Space>
              }
            >
              <div className="padding-20">
                <Row gutter={20}>
                  <Col md={24}>
                    <Form.Item label="Sản phẩm">
                      <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm sản phẩm/ SKU/ mã vạch (F3)"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <PurchaseItem />
            </Card>
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <PurchaseInfo />
          </Col>
        </Row>
        <div className="margin-top-20 text-right">
          <Space size={12}>
            <Button>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default CreatePO;
