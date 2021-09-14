import CustomTable from "component/table/CustomTable";
import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";

import actionColumn from "../../actions/action.column";
import { StyledComponent } from "./styles";
import { Button, Form, Row, Col, Select, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

import { TotalItemsEcommerceQuery } from "model/query/ecommerce.query";
import { TotalItemsEcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { TotalItemsEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";
import { PageResponse } from "model/base/base-metadata.response";

//thai fake data
import vectorIcon from "assets/icon/vector.svg";

type TotalItemsEcommerceProps = {
  configData: any;
  setConfigToView: (value: TotalItemsEcommerceResponse) => void;
};

const TotalItemsEcommerce: React.FC<TotalItemsEcommerceProps> = (
  props: TotalItemsEcommerceProps
) => {
  const { configData, setConfigToView } = props;
  const history = useHistory();
  const [activatedBtn, setActivatedBtn] = React.useState({
    title: "",
    icon: "",
    id: "all",
    isActive: "",
    key: 1,
  });
  const handleUpdate = (item: any) => {
    setConfigToView(item);
    history.replace(`${history.location.pathname}#setting`);
  };

  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const handleDisconnect = () => {};

  //thai need todo
  const [columns] = useState<any>([
    {
      title: "Ảnh",
      visible: true,
      align: "center",
      render: ( i: any) => {
        return <img src={vectorIcon} alt=""></img>;
      },
    },
    {
      title: "Sku/ itemID (Shopee)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return <span>Sku/ itemID (Shopee) nè</span>
      },
    },
    {
      title: "Sản phẩm (Shopee)",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span>sản phẩm shopee nè</span>
        );
      },
    },
    {
      title: "Giá bán (Shopee)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>Giá bán (Shopee) nè</span>
        );
      },
    },
    {
      title: "Sản phẩm (YODY)",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span>sản phẩm YODY nè</span>
        );
      },
    },
    {
      title: "Giá bán (YODY)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>Giá bán (YODY) nè</span>
        );
      },
    },
    {
      title: "Tồn",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>Tồn 100 nè</span>
        );
      },
    },
    {
      title: "Ghép nối",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span>Ghép nối nè</span>
        );
      },
    },
    {
      title: "Đồng bộ tồn kho",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>Đồng bộ tồn kho nè</span>
        );
      },
    },
    
    actionColumn(handleUpdate, handleDisconnect),
  ]);

  const configDataFiltered = configData.filter((item: any) => {
    if (activatedBtn.id === "all") {
      return true;
    } else {
      return item.ecommerce === activatedBtn.id;
    }
  });

  const [data, setData] = React.useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const params: TotalItemsEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      request: "",
      gender: null,
      from_birthday: null,
      to_birthday: null,
      company: null,
      from_wedding_date: null,
      to_wedding_date: null,
      customer_type_id: null,
      customer_group_id: null,
      customer_level_id: null,
      responsible_staff_code: null,
    }),
    []
  );

  const [query, setQuery] = React.useState<TotalItemsEcommerceQuery>({
    page: 1,
    limit: 30,
    request: null,
    gender: null,
    from_birthday: null,
    to_birthday: null,
    company: null,
    from_wedding_date: null,
    to_wedding_date: null,
    customer_type_id: null,
    customer_group_id: null,
    customer_level_id: null,
    responsible_staff_code: "",
  });

  const onSearch = (value: TotalItemsEcommerceQuery) => {
    query.request = value && value.request;
    const querySearch: TotalItemsEcommerceQuery = value;
    dispatch(TotalItemsEcommerceList(querySearch, setData));
  };

  const onFinish = (value: TotalItemsEcommerceQuery) => {
    value.responsible_staff_code = value.responsible_staff_code
      ? value.responsible_staff_code.split(" - ")[0]
      : null;
    onSearch(value);
  };

  //thai fake data 
  const LIST_STORE = [
    {
      id: 1,
      name: "store 1",
      value: "store_1"
    },
    {
      id: 2,
      name: "store 2",
      value: "store_2"
    }
  ]
  ////////////////////

  return (
    <StyledComponent>
      <div className="total-items-ecommerce">
        <div className="filter">
          <Form
            form={formAdvance}
            onFinish={onFinish}
            initialValues={params}
          >
            <Form.Item name="store" className="select-store-dropdown">
              <Select
                showSearch
                placeholder="Chọn gian hàng"
                allowClear
                optionFilterProp="children"
              >
                {LIST_STORE &&
                  LIST_STORE.map((c: any) => (
                    <Option key={c.value} value={c.value}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item name="shopee-items" className="shoppe-search">
              <Input
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, tên sản phẩm Shopee"
              />
            </Form.Item>

            <Form.Item name="YODY-items" className="yody-search">
              <Input
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, Sản phẩm YODY"
              />
            </Form.Item>

            <Form.Item className="filter-item">
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Form.Item>

            <Form.Item className="filter-item">
              <Button onClick={() => {}}>Thêm bộ lọc</Button>
            </Form.Item>
          </Form>
        </div>

        <CustomTable
          columns={columns}
          dataSource={configDataFiltered}
          pagination={false}
          // pagination={{
          //   pageSize: data.metadata.limit,
          //   total: data.metadata.total,
          //   current: data.metadata.page,
          //   showSizeChanger: true,
          //   onChange: onPageChange,
          //   onShowSizeChange: onPageChange,
          // }}
          rowKey={(data) => data.id}
        />
      </div>
    </StyledComponent>
  );
};

export default TotalItemsEcommerce;
