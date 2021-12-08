import { Row, Col, Checkbox } from "antd";
import CustomTable from "component/table/CustomTable";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomerModal from "../../customer-modal";
import {
  CreateShippingAddress,
  DeleteShippingAddress,
  UpdateShippingAddress,
} from "domain/actions/customer/customer.action";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess, showError } from "utils/ToastUtils";
import UrlConfig from "config/url.config";
import { ShippingAddress } from "model/response/customer/customer.response";
import { CustomerShippingAddress } from "model/request/customer.request";
import FormCustomerShippingAddress from "screens/customer/customer-detail/customer-shipping/shipping.form.modal";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import actionColumn from "../../common/action.column";
import { modalActionType } from "model/modal/modal.model";
import { CustomerResponse } from "model/response/customer/customer.response";

type CustomerShippingAddressInfoProps = {
  customer: CustomerResponse | undefined;
  customerDetailState: string;
  modalAction: modalActionType;
  isShowModalShipping: boolean;
  allowUpdateCustomer: boolean;
  setIsShowModalShipping: (value: boolean) => void;
  setModalAction: (value: modalActionType) => void;
};

const CustomerShippingAddressInfo: React.FC<CustomerShippingAddressInfoProps> =
  (props: CustomerShippingAddressInfoProps) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const {
      customer,
      customerDetailState,
      setModalAction,
      modalAction,
      isShowModalShipping,
      allowUpdateCustomer,
      setIsShowModalShipping,
    } = props;
    const [modalSingleShippingAddress, setModalShippingAddress] =
      React.useState<CustomerShippingAddress>();
    const gotoFirstPage = (customerId: any) => {
      history.replace(
        `${UrlConfig.CUSTOMER}/` + customerId + `#${customerDetailState}`
      );
    };
    const shippingColumnFinal = () =>
      shippingColumns.filter((item) => item.visible === true);

    const [isVisibleShippingModal, setIsVisibleShippingModal] =
      React.useState<boolean>(false);

    const handleShippingEdit = () => {
      setIsShowModalShipping(true);
    };

    const handleShippingDelete = () => {
      setIsVisibleShippingModal(true);
    };
    const onOkShippingDelete = () => {
      handleShippingAddressForm.delete();
      setIsVisibleShippingModal(false);
    };
    const onCancelShippingDelete = () => {
      setIsVisibleShippingModal(false);
    };
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
              gotoFirstPage(customer.id);
              if (data) {
                showSuccess("Đặt mặc định thành công");
              } else {
                showError("Đặt mặc định thất bại");
              }
            }
          )
        );
    };
    const shippingColumns: Array<ICustomTableColumType<ShippingAddress>> = [
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
        render: (value, row, index) => {
          return <div style={{ width: 200 }}>{row.name}</div>;
        },
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        visible: true,
      },
      // {
      //   title: "Quốc gia",
      //   dataIndex: "country",
      //   visible: true,
      // },
      {
        title: "Địa chỉ",
        dataIndex: "full_address",
        visible: true,
        render: (value, row, index) => {
          return (
            <div>
              <div
                className="text"
                title={row.code}
                style={{ color: "#666666", width: 300 }}
              >
                {`${row.full_address ? row.full_address : ""}`}
              </div>
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
        render: (l: ShippingAddress, item: any, index: number) => {
          return (
            <Checkbox
              checked={item.default}
              onClick={(value) => handleShippingDefault(value, item)}
              disabled={!allowUpdateCustomer}
            />
          );
        },
      },
      actionColumn(
        handleShippingEdit,
        handleShippingDelete,
        customerDetailState
      ),
    ];
    // add shipping

    const handleShippingAddressForm = {
      create: (formValue: CustomerShippingAddress) => {
        if (customer?.shipping_addresses && customer?.shipping_addresses.length <= 0) {
          formValue.is_default = true;
        } else {
          formValue.is_default = false;
        }
        if (customer)
          dispatch(
            CreateShippingAddress(
              customer.id,
              formValue,
              (data: ShippingAddress) => {
                setIsShowModalShipping(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Thêm mới địa chỉ thành công")
                  : showError("Thêm mới địa chỉ thất bại");
              }
            )
          );
      },
      edit: (formValue: CustomerShippingAddress) => {
        formValue.is_default = formValue.default;
        if (modalSingleShippingAddress) {
          if (customer)
            dispatch(
              UpdateShippingAddress(
                modalSingleShippingAddress.id,
                customer.id,
                formValue,
                (data: ShippingAddress) => {
                  setIsShowModalShipping(false);
                  gotoFirstPage(customer.id);
                  data
                    ? showSuccess("Cập nhật địa chỉ thành công")
                    : showError("Cập nhật địa chỉ thất bại");
                }
              )
            );
        }
      },
      delete: () => {
        if (modalSingleShippingAddress) {
          if (customer)
            dispatch(
              DeleteShippingAddress(
                modalSingleShippingAddress.id,
                customer.id,
                (data: ShippingAddress) => {
                  setIsShowModalShipping(false);
                  gotoFirstPage(customer.id);
                  data
                    ? showSuccess("Xóa địa chỉ thành công")
                    : showError("Xóa địa chỉ thất bại");
                }
              )
            );
        }
      },
    };
    return (
      <Row>
        <Col span={24}>
          <CustomTable
            showColumnSetting={false}
            // scroll={{ x: 1080 }}
            // pagination={{
            //   pageSize: customer
            //     ? customer.shipping_addresses
            //       ? customer.shipping_addresses.length
            //       : 0
            //     : 0,
            //   total: customer
            //     ? customer.shipping_addresses
            //       ? customer.shipping_addresses.length
            //       : 0
            //     : 0,
            //   current: 1,
            //   showSizeChanger: true,
            //   // onChange: onPageChange,
            //   // onShowSizeChange: onPageChange,
            // }}
            pagination={false}
            dataSource={customer ? customer.shipping_addresses.reverse() : []}
            columns={shippingColumnFinal()}
            rowKey={(item: ShippingAddress) => item.id}
            onRow={(record: CustomerShippingAddress) => {
              return {
                onClick: (event) => {
                  setModalShippingAddress(record);
                  setModalAction("edit");
                  // setIsShowModalShipping(true);
                }, // click row
              };
            }}
          />
          <CustomerModal
            createBtnTitle="Tạo mới địa chỉ"
            updateBtnTitle="Lưu địa chỉ"
            visible={isShowModalShipping}
            onCreate={(formValue: CustomerShippingAddress) =>
              handleShippingAddressForm.create(formValue)
            }
            onEdit={(formValue: CustomerShippingAddress) =>
              handleShippingAddressForm.edit(formValue)
            }
            onDelete={() => {}}
            onCancel={() => setIsShowModalShipping(false)}
            modalAction={modalAction}
            modalTypeText="Địa chỉ nhận hàng"
            componentForm={FormCustomerShippingAddress}
            formItem={modalSingleShippingAddress}
            deletedItemTitle={modalSingleShippingAddress?.name}
          />
        </Col>
        <div
          style={{
            padding: "0 16px 10px 0",
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        ></div>
        <SaveAndConfirmOrder
          onCancel={onCancelShippingDelete}
          onOk={onOkShippingDelete}
          visible={isVisibleShippingModal}
          okText="Đồng ý"
          cancelText="Hủy"
          title=""
          text="Bạn có chắc chắn xóa địa chỉ giao hàng này không?"
          icon={DeleteIcon}
        />
      </Row>
    );
  };

export default CustomerShippingAddressInfo;
