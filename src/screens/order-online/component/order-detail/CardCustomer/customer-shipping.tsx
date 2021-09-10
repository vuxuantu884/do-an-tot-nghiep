import { Row, Col, Checkbox } from "antd";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { CustomerResponse, shippingAddress } from "model/response/customer/customer.response";
import actionColumn from "../../../common/action.column";
import { CustomerShippingAddress } from "model/request/customer.request";
import React, { useCallback } from "react";
import { showError, showSuccess } from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import UrlConfig from "config/url.config";
import {
  CustomerDetail,
  // CreateShippingAddress,
  // DeleteShippingAddress,
  UpdateShippingAddress,
} from "domain/actions/customer/customer.action";

function CustomerShippingAddressOrder(props: any) {
  const {
    customer,
    handleChangeCustomer,
    handleShippingEdit,
    handleShippingDelete,
    handleSingleShippingAddress,
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();

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
          (data: shippingAddress) => {
            //history.replace(`${UrlConfig.ORDER}/create`);
            if (data) {
              dispatch(CustomerDetail(
                  customer.id,
                    (datas:CustomerResponse)=>{
                        handleChangeCustomer(datas)
                    }
                ));
              showSuccess("Đặt mặc định thành công");
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
  };

  const [customerDetailState, setCustomerDetailState] = React.useState("");

  const shippingColumnFinal = () =>
    shippingColumns.filter((item) => item.visible === true);

  const shippingColumns: Array<ICustomTableColumType<shippingAddress>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "5%",
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
        return (
          <span style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
            {row.name}
          </span>
        );
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
      title: "Mặc định",
      dataIndex: "default",
      align: "center",
      visible: true,
      width: "10%",
      render: (l: shippingAddress, item: any, index: number) => {
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
          showColumnSetting={false}
          pagination={false}
          dataSource={customer ? customer.shipping_addresses : []}
          columns={shippingColumnFinal()}
          rowKey={(item: shippingAddress) => item.id}
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
