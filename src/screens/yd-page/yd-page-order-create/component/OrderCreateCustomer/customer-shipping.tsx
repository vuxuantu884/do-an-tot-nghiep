import { Row, Col, Checkbox } from "antd";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import {
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { CustomerShippingAddress } from "model/request/customer.request";
import React from "react";
import { showError, showSuccess } from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import {
  getCustomerDetailAction,
  UpdateShippingAddress,
} from "domain/actions/customer/customer.action";

function CustomerShippingAddressOrder(props: any) {
  const {
    customer,
    handleChangeCustomer,
    handleSingleShippingAddress,
    handleShippingAddress,
    setVisibleChangeAddress
  } = props;
  const dispatch = useDispatch();

  const handleShippingDefault = (value: any, item: any) => {
    let _item = { ...item };
    if (_item.default === true) return showError("Không thể bỏ mặc định");
    _item.is_default = value.target.checked;
    if (customer)
      dispatch(
        UpdateShippingAddress(
          _item.id,
          customer.id,
          _item,
          (data: ShippingAddress) => {
            //history.replace(`${UrlConfig.ORDER}/create`);
            if (data) {
              dispatch(
                getCustomerDetailAction(customer.id, (datas: CustomerResponse) => {
                  handleChangeCustomer(datas);
                })
              );
              if(handleShippingAddress)handleShippingAddress(data);
              showSuccess("Đặt mặc định thành công");
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
      setVisibleChangeAddress(false)
  };

  const shippingColumnFinal = () =>
    shippingColumns.filter((item) => item.visible === true);

  const shippingColumns: Array<ICustomTableColumType<ShippingAddress>> = [
    {
      title: "Họ tên",
      dataIndex: "name",
      visible: true,
      align: "center",
      width: "25%",
      render: (value, row ) => {
        return (
          <span style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
            {row.name}
          </span>
        );
      },
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      align: "center",
      visible: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "full_address",
      visible: true,
      align: "center",
      render: (value, row) => {
        return (
          <div>
            <span
              className="text"
              title={row.code}
              style={{ color: "#666666" }}
            >
              {`${row.full_address ? row.full_address : ""}`}
            </span>
            <span
              className="text"
              title={row.code}
              style={{ color: "#222222", display: "block" }}
            >
              {`${row.ward ? row.ward : ""}${
                row.district ? " - " + row.district : ""
              }${row.city ? " - " + row.city : ""}`}
            </span>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "default",
      align: "center",
      visible: true,
      width: "10%",
      render: (l: ShippingAddress, item: any) => {
        return (
          <Checkbox
            checked={item.default}
            onClick={(value) => handleShippingDefault(value, item)}
          />
        );
      },
    },
    // actionColumn(handleShippingEdit, handleShippingDelete, customerDetailState),
  ];

  return (
    <Row style={{ marginTop: 16 }}>
      <Col span={24}>
        <CustomTable
          bordered
          showColumnSetting={false}
          pagination={false}
          dataSource={customer ? customer.shipping_addresses : []}
          columns={shippingColumnFinal()}
          rowKey={(item: ShippingAddress) => item.id}
          onRow={(record: CustomerShippingAddress) => {
            return {
              onClick: () => {
                handleSingleShippingAddress(record);
              }, // click row
            };
          }}
        />
      </Col>
    </Row>
  );
}

export default CustomerShippingAddressOrder;
