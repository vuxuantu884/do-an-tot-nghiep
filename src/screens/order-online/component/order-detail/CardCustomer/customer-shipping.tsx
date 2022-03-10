import { Row, Col, Checkbox } from "antd";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import {
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import actionColumn from "../../../common/action.column";
import { CustomerShippingAddress } from "model/request/customer.request";
import React from "react";
import { showError, showSuccess } from "utils/ToastUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  getCustomerDetailAction,
  UpdateShippingAddress,
} from "domain/actions/customer/customer.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { handleCalculateShippingFeeApplyOrderSetting, totalAmount } from "utils/AppUtils";

function CustomerShippingAddressOrder(props: any) {
  const {
    customer,
    handleChangeCustomer,
    handleShippingEdit,
    handleShippingDelete,
    handleSingleShippingAddress,
    handleShippingAddress,
    form,
    setShippingFeeInformedToCustomer,
  } = props;
  const dispatch = useDispatch();

  const orderLineItems = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.orderLineItems);

  const shippingServiceConfig = useSelector((state: RootReducerType) => state.orderReducer.shippingServiceConfig);

  const transportService = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service);

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
              const orderAmount = totalAmount(orderLineItems);
              handleCalculateShippingFeeApplyOrderSetting(data.city_id, orderAmount, shippingServiceConfig,
                transportService, form, setShippingFeeInformedToCustomer
                );
              showSuccess("Đặt mặc định thành công");
              handleShippingAddress(data);
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
  };

  const [customerDetailState] = React.useState("");

  const shippingColumnFinal = () =>
    shippingColumns.filter((item) => item.visible === true);

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
              {`${row.ward ? row.ward : ""}${row.district ? " - " + row.district : ""
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
