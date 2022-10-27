import { Checkbox, Col, Row } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {
  getCustomerDetailAction,
  UpdateShippingAddress,
} from "domain/actions/customer/customer.action";
import { CustomerShippingAddress } from "model/request/customer.request";
import { CustomerResponse, ShippingAddress } from "model/response/customer/customer.response";
import React from "react";
import { useDispatch } from "react-redux";
import { showError, showSuccess } from "utils/ToastUtils";
import actionColumn from "../../../common/action.column";

function CustomerShippingAddressOrder(props: any) {
  const {
    customer,
    handleChangeCustomer,
    handleShippingEdit,
    handleShippingDelete,
    handleSingleShippingAddress,
    handleShippingAddress,
    isOrderUpdate,
    handleChangeShippingFeeApplyOrderSettings,
  } = props;
  const dispatch = useDispatch();

  console.log("isOrderUpdate3", isOrderUpdate);

  const handleShippingDefault = (value: any, item: any) => {
    let _item = { ...item };
    if (_item.default === true) return showError("Không thể bỏ mặc định");
    _item.is_default = value.target.checked;
    if (customer)
      dispatch(
        UpdateShippingAddress(_item.id, customer.id, _item, (data: ShippingAddress) => {
          //history.replace(`${UrlConfig.ORDER}/create`);
          if (data) {
            dispatch(
              getCustomerDetailAction(customer.id, (datas: CustomerResponse) => {
                handleChangeCustomer(datas);
              }),
            );
            handleChangeShippingFeeApplyOrderSettings({
              customerShippingAddressCityId: data.city_id,
            });
            showSuccess("Đặt mặc định thành công");
            handleShippingAddress(data);
          } else {
            showError("Đặt mặc định thất bại");
          }
        }),
      );
  };

  const [customerDetailState] = React.useState("");

  const shippingColumnFinal = () => shippingColumns.filter((item) => item.visible === true);

  const shippingColumns: Array<ICustomTableColumType<ShippingAddress>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "10%",
      render: (value, row, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Họ tên người nhận",
      dataIndex: "name",
      visible: true,
      width: "20%",
      render: (value, row, index) => {
        return <span style={{ wordWrap: "break-word", wordBreak: "break-all" }}>{row.name}</span>;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "full_address",
      visible: true,
      render: (value, row, index) => {
        return (
          <div>
            <span className="text" title={row.code} style={{ color: "#666666" }}>
              {`${row.full_address ? row.full_address : ""}`}
            </span>
            <span className="text" title={row.code} style={{ color: "#222222", display: "block" }}>
              {`${row.ward ? row.ward : ""}${row.district ? " - " + row.district : ""}${
                row.city ? " - " + row.city : ""
              }`}
            </span>
          </div>
        );
      },
    },
    {
      title: "Mặc định",
      dataIndex: "default",
      align: "center",
      visible: true,
      width: "10%",
      render: (l: ShippingAddress, item: any, index: number) => {
        return (
          <Checkbox
            checked={item.default}
            onClick={(value) => handleShippingDefault(value, item)}
          />
        );
      },
    },
    actionColumn(handleShippingEdit, handleShippingDelete, customerDetailState),
  ];

  return (
    <Row style={{ marginTop: 16 }}>
      <Col span={24}>
        <CustomTable
          style={{ minWidth: 600 }}
          showColumnSetting={false}
          pagination={false}
          dataSource={customer ? customer.shipping_addresses : []}
          columns={shippingColumnFinal()}
          rowKey={(item: ShippingAddress) => item.id}
          onRow={(record: CustomerShippingAddress) => {
            return {
              onClick: (event) => {
                handleSingleShippingAddress(record);
                //setModalAction("edit");
                // setIsShowModalShipping(true);
              }, // click row
            };
          }}
        />
      </Col>
    </Row>
  );
}

export default CustomerShippingAddressOrder;
