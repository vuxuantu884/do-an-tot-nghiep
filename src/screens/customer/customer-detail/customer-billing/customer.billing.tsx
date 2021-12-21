import { Row, Col, Checkbox } from "antd";
import CustomTable from "component/table/CustomTable";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomerModal from "../../customer-modal";

import {
  CreateBillingAddress,
  DeleteBillingAddress,
  UpdateBillingAddress,
} from "domain/actions/customer/customer.action";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess, showError } from "utils/ToastUtils";
import UrlConfig from "config/url.config";
import { billingAddress } from "model/response/customer/customer.response";
import { CustomerBillingAddress } from "model/request/customer.request";
import FormCustomerBillingAddress from "screens/customer/customer-detail/customer-billing/billing.form.modal";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import actionColumn from "../../common/action.column";
import { modalActionType } from "model/modal/modal.model";
import { CustomerResponse } from "model/response/customer/customer.response";


type CustomerBillingInfoProps = {
    customer: CustomerResponse | undefined,
    customerDetailState: string,
    modalAction: modalActionType ,
    isShowModalBilling: boolean,
    allowUpdateCustomer: boolean,
    setModalAction: (value: modalActionType) => void,
    setIsShowModalBilling: (value: boolean) => void,
}

const CustomerBillingInfo: React.FC<CustomerBillingInfoProps> = (props: CustomerBillingInfoProps) => {
  const {
    customer,
    customerDetailState,
    setModalAction,
    modalAction,
    isShowModalBilling,
    allowUpdateCustomer,
    setIsShowModalBilling,
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const billingColumnFinal = () =>
    billingColumns.filter((item) => item.visible === true);
  const [modalSingleBillingAddress, setModalBillingAddress] =
    React.useState<CustomerBillingAddress>();

  // billing columns
  const [isVisibleBillingModal, setIsVisibleBillingModal] =
    React.useState<boolean>(false);

  const handleBillingEdit = () => {
    setIsShowModalBilling(true);
  };
  const handleBillingDelete = () => {
    setIsVisibleBillingModal(true);
  };
  const onOkBillingDelete = () => {
    handleBillingAddressForm.delete();
    setIsVisibleBillingModal(false);
  };
  const onCancelBillingDelete = () => {
    setIsVisibleBillingModal(false);
  };
  const billingColumns: Array<ICustomTableColumType<billingAddress>> = [
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
      width: "15%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
      width: "10%",
    },
    {
      title: "Email",
      dataIndex: "email",
      visible: true,
      width: "25%",
    },
    {
      title: "Mã số thuế",
      dataIndex: "tax_code",
      visible: true,
      width: "10%",
    },
    {
      title: "Địa chỉ",
      dataIndex: "full_address",
      visible: true,
      render: (value, row, index) => {
        return (
          <div>
            <div style={{ color: "#666666" }}>
              {`${row.full_address ? row.full_address : ""}`}
            </div>
            <div style={{ color: "#222222" }}>
              {`${row.ward ? row.ward : ""}${
                row.district ? " - " + row.district : ""
              }${row.city ? " - " + row.city : ""}`}
            </div>
          </div>
        );
      },
    },
    {
      title: "Mặc định",
      dataIndex: "default",
      align: "center",
      visible: true,
      width: "5%",
      render: (l: any, item: any, index: number) => {
        return (
          <Checkbox
            checked={item.default}
            onClick={(value) => handleBillingDefault(value, item)}
            disabled={!allowUpdateCustomer}
          />
        );
      },
    },
    actionColumn(handleBillingEdit, handleBillingDelete, customerDetailState),
  ];
  
  const handleBillingDefault = (value: any, item: any) => {
    let _item = { ...item };
    if (_item.default === true) return showError("Không thể bỏ mặc định");
    _item.is_default = value.target.checked;
    if (customer)
      dispatch(
        UpdateBillingAddress(
          _item.id,
          customer.id,
          _item,
          (data: billingAddress) => {
            gotoFirstPage(customer.id);
            if (data) {
              data.default
                ? showSuccess("Đặt mặc định thành công")
                : showSuccess("Bỏ mặc định thành công");
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
  };
  // handle billing
  const handleBillingAddressForm = {
    create: (formValue: CustomerBillingAddress) => {
      if (customer?.billing_addresses && customer?.billing_addresses.length <= 0) {
        formValue.is_default = true;
      } else {
        formValue.is_default = false;
      }
      if (customer)
        dispatch(
          CreateBillingAddress(
            customer.id,
            formValue,
            (data: billingAddress) => {
              setIsShowModalBilling(false);
              gotoFirstPage(customer.id);
              data
                ? showSuccess("Thêm mới địa chỉ thành công")
                : showError("Thêm mới địa chỉ thất bại");
            }
          )
        );
    },
    edit: (formValue: CustomerBillingAddress) => {
      formValue.is_default = formValue.default;
      if (modalSingleBillingAddress) {
        if (customer)
          dispatch(
            UpdateBillingAddress(
              modalSingleBillingAddress.id,
              customer.id,
              formValue,
              (data: billingAddress) => {
                setIsShowModalBilling(false);
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
      if (modalSingleBillingAddress) {
        if (customer)
          dispatch(
            DeleteBillingAddress(
              modalSingleBillingAddress.id,
              customer.id,
              (data: billingAddress) => {
                setIsShowModalBilling(false);
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
  // end
  const gotoFirstPage = (customerId: any) => {
    history.replace(`${UrlConfig.CUSTOMER}/` + customerId + `#${customerDetailState}`);
  };
  return (
    <Row>
      <Col span={24}>
        <CustomTable
          showColumnSetting={false}
          // scroll={{ x: 1080 }}
          // pagination={{
          //   pageSize: customer
          //     ? customer.billing_addresses
          //       ? customer.billing_addresses.length
          //       : 0
          //     : 0,
          //   total: customer
          //     ? customer.billing_addresses
          //       ? customer.billing_addresses.length
          //       : 0
          //     : 0,
          //   current: 1,
          //   showSizeChanger: true,
          //   // onChange: onPageChange,
          //   // onShowSizeChange: onPageChange,
          // }}
          pagination={false}
          dataSource={customer ? customer.billing_addresses.reverse() : []}
          columns={billingColumnFinal()}
          rowKey={(item: billingAddress) => item.id}
          onRow={(record: CustomerBillingAddress) => {
            return {
              onClick: (event) => {
                setModalBillingAddress(record);
                setModalAction("edit");
                // setIsShowModalBilling(true);
              }, // click row
            };
          }}
        />
        <CustomerModal
          createBtnTitle="Tạo mới địa chỉ"
          updateBtnTitle="Lưu địa chỉ"
          visible={isShowModalBilling}
          onCreate={(formValue: CustomerBillingAddress) =>
            handleBillingAddressForm.create(formValue)
          }
          onEdit={(formValue: CustomerBillingAddress) =>
            handleBillingAddressForm.edit(formValue)
          }
          onDelete={() => handleBillingAddressForm.delete()}
          onCancel={() => setIsShowModalBilling(false)}
          modalAction={modalAction}
          modalTypeText="Địa chỉ nhận hóa đơn"
          componentForm={FormCustomerBillingAddress}
          formItem={modalSingleBillingAddress}
          deletedItemTitle={modalSingleBillingAddress?.name}
        />
      </Col>
      <SaveAndConfirmOrder
        onCancel={onCancelBillingDelete}
        onOk={onOkBillingDelete}
        visible={isVisibleBillingModal}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
        text="Bạn có chắc chắn xóa địa chỉ gửi hóa đơn này không?"
        icon={DeleteIcon}
      />
    </Row>
  );
}

export default CustomerBillingInfo;
