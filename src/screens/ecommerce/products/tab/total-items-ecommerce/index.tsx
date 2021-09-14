import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";

import { StyledComponent } from "./styles";
import { Button, Form, Row, Col, Select, Input, Modal, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import disconnectIcon from "assets/icon/disconnect.svg";
import warningCircleIcon from "assets/icon/warning-circle.svg";
import filterIcon from "assets/icon/filter.svg"
import deleteIcon from "assets/icon/deleteIcon.svg"

import CustomTable from "component/table/CustomTable";
import actionColumn from "../../actions/action.column";
import BaseFilter from "component/filter/base.filter"
import { showSuccess, showError, showWarning } from "utils/ToastUtils";

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

  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [visibleFilter, setVisibleFilter] = React.useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = React.useState(false);

  const handleEdit = (item: any) => {
    showSuccess("Cập nhật sản phẩm thành công");
  };

  const handleDisconnect = () => {
    setIsShowModalDisconnect(true);
  };

  const cancelDisconnectModal = () => {
    setIsShowModalDisconnect(false);
  };

  const okDisconnectModal = () => {
    setIsShowModalDisconnect(false);
    showSuccess("Ngắt kết nối sản phẩm thành công");
    //thai need todo: API
  };
  

  

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
      title: () => {
        return (
          <div>
            <span>"Đồng bộ tồn"</span>
            <Tooltip overlay="Kết quả đồng bộ tồn kho lần gần nhất" placement="top" trigger="click">
              <img src={warningCircleIcon} style={{ marginLeft: 5, cursor: "pointer" }} alt="" />
            </Tooltip>
          </div>
        )
      },
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>Đồng bộ tồn kho nè</span>
        );
      },
    },
    
    actionColumn(handleEdit, handleDisconnect),
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
  const LIST_CHANNEL = [
    {
      id: 1,
      name: "Sàn Shopee",
      value: "shopeeChannel"
    }
  ]

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

  const CATEGORY = [
    {
      id: 1,
      name: "category 1",
      value: "category_1"
    },
    {
      id: 2,
      name: "category 2",
      value: "category_2"
    }
  ]


  
  ////////////////////

  const onFilterClick = React.useCallback(() => {
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance]);

  const onClearFilterAdvanceClick = React.useCallback(() => {
    formAdvance.setFieldsValue(params);
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance, params]);

  const openFilter = React.useCallback(() => {
    setVisibleFilter(true);
  }, []);

  const onCancelFilter = React.useCallback(() => {
    setVisibleFilter(false);
  }, []);

  return (
    <StyledComponent>
      <div className="total-items-ecommerce">
        <div className="filter">
          <Form
            form={formAdvance}
            onFinish={onFinish}
            initialValues={params}
          >
            <Form.Item name="channel" className="select-channel-dropdown">
              <Select
                showSearch
                placeholder="Chọn sàn"
                allowClear
                optionFilterProp="children"
              >
                {LIST_CHANNEL &&
                  LIST_CHANNEL.map((c: any) => (
                    <Option key={c.value} value={c.value}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

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
              <Button onClick={openFilter}>
                <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
                <span>Thêm bộ lọc</span>
              </Button>
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

        <BaseFilter
          onClearFilter={onClearFilterAdvanceClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visibleFilter}
          className="total-items-ecommerce-filter"
          confirmButtonTitle="Áp dụng bộ lọc"
          deleteButtonTitle={
            <div>
              <img src={deleteIcon} style={{ marginRight: 10 }} alt="" />
              <span style={{ color: "red" }}>Xóa bộ lọc</span>
            </div>
          }
        >
          <Form
            form={formAdvance}
            onFinish={onFinish}
            //ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            <Form.Item
              name="category"
              label={<b>CHỌN SÀN</b>}
            >
              <Select
                showSearch
                placeholder=""
                allowClear
              >
                {CATEGORY.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label={<b>CHỌN GIAN HÀNG</b>}
            >
              <Select
                showSearch
                placeholder=""
                allowClear
              >
                {CATEGORY.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label={<b>DANH MỤC</b>}
            >
              <Select
                showSearch
                placeholder=""
                allowClear
              >
                {CATEGORY.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="pairing"
              label={<b>TRẠNG THÁI GHÉP NỐI</b>}
            >
              <Select
                showSearch
                placeholder=""
                allowClear
              >
                {CATEGORY.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="inventoryStatus"
              label={<b>TRẠNG THÁI ĐỒNG BỘ TỒN KHO</b>}
            >
              <Select
                showSearch
                placeholder=""
                allowClear
              >
                {CATEGORY.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

          </Form>
        </BaseFilter>

        <Modal
          width="600px"
          className="modal-confirm-customer"
          visible={isShowModalDisconnect}
          okText="Đồng ý"
          cancelText="Hủy"
          onCancel={cancelDisconnectModal}
          onOk={okDisconnectModal}
        >
          <div style={{margin: "20px 0"}}>
            <img src={disconnectIcon} style={{ marginRight: 20 }} alt="" />
            <span>Bạn có chắc chắn muốn hủy liên kết sản phẩm không?</span>
          </div>
        </Modal>

      </div>
    </StyledComponent>
  );
};

export default TotalItemsEcommerce;
