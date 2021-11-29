import { Row, Col } from "antd";
import CustomTable from "component/table/CustomTable";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomerModal from "../../customer-modal";

import {
  CreateContact,
  UpdateContact,
  DeleteContact,
} from "domain/actions/customer/customer.action";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess, showError } from "utils/ToastUtils";
import UrlConfig from "config/url.config";
import { contact } from "model/response/customer/customer.response";
import { CustomerContact } from "model/request/customer.request";
import FormCustomerContact from "screens/customer/customer-detail/customer-contact/contact.form.modal";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import actionColumn from "../../common/action.column";
import { modalActionType } from "model/modal/modal.model";
import { CustomerResponse } from "model/response/customer/customer.response";


type CustomerContactInfoProps = {
  customer: CustomerResponse | undefined,
  customerDetailState: string,
  modalAction: modalActionType ,
  isShowModalContacts: boolean,
  setIsShowModalContacts: (value: boolean) => void,
  setModalAction: (value: modalActionType) => void,
}

const CustomerContactInfo: React.FC<CustomerContactInfoProps> = (props: CustomerContactInfoProps) => {
  const {
    customer,
    customerDetailState,
    setModalAction,
    modalAction,
    setIsShowModalContacts,
    isShowModalContacts,
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const [isVisibleContactModal, setIsVisibleContactModal] =
    React.useState<boolean>(false);
  const [modalSingleContact, setModalSingleContact] =
    React.useState<CustomerContact>();
  // contact column
  const gotoFirstPage = (customerId: any) => {
    history.replace(`${UrlConfig.CUSTOMER}/` + customerId + `#${customerDetailState}`);
  };
  const handleContactEdit = () => {
    setIsShowModalContacts(true);
  };

  const handleContactDelete = () => {
    setIsVisibleContactModal(true);
  };

  const columns: Array<ICustomTableColumType<contact>> = [
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
      title: "Tên người liên hệ",
      dataIndex: "",
      visible: true,
      // width: "20%",
      render: (value, row, index) => {
        return <div style={{ width: 200 }}>{row.name}</div>;
      },
    },

    {
      title: "Email",
      dataIndex: "email",
      visible: true,
      // width: "20%",
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      visible: true,
      // width: "20%",
    },
    {
      title: "Chức vụ/phòng ban",
      visible: true,
      render: (value, row, index) => {
        return <div style={{ width: 200 }}>{row.title}</div>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      // width: "20%",
      render: (value, row, index) => {
        return (
          <div
            className="text"
            title={value}
            style={{ color: "#666666", width: 200 }}
          >
            {value}
          </div>
        );
      },
    },
    actionColumn(handleContactEdit, handleContactDelete, customerDetailState),
  ];
  const columnFinal = () => columns.filter((item) => item.visible === true);
  const customerContactFiltered = customer?.contacts?.filter((contact: any) => {
    if (
      contact.title ||
      contact.name ||
      contact.email ||
      contact.phone ||
      contact.note
    ) {
      return true;
    }
    return false;
  });
  const handleContactForm = {
    create: (formValue: CustomerContact) => {
      if (customer)
        dispatch(
          CreateContact(customer.id, formValue, (data: contact) => {
            setIsShowModalContacts(false);
            gotoFirstPage(customer.id);
            data
              ? showSuccess("Tạo mới liên hệ thành công")
              : showError("Tạo mới liên hệ thất bại");
          })
        );
    },
    edit: (formValue: CustomerContact) => {
      if (modalSingleContact) {
        if (customer)
          dispatch(
            UpdateContact(
              modalSingleContact.id,
              customer.id,
              formValue,
              (data: contact) => {
                setIsShowModalContacts(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Cập nhật liên hệ thành công")
                  : showError("Cập nhật liên hệ thất bại");
              }
            )
          );
      }
    },
    delete: () => {
      if (modalSingleContact) {
        if (customer)
          dispatch(
            DeleteContact(
              modalSingleContact.id,
              customer.id,
              (data: contact) => {
                setIsShowModalContacts(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Xóa liên hệ thành công")
                  : showError("Xóa liên hệ thất bại");
              }
            )
          );
      }
    },
  };
  const onOkContactDelete = () => {
    handleContactForm.delete();
    setIsVisibleContactModal(false);
  };
  const onCancelContactDelete = () => {
    setIsVisibleContactModal(false);
  };
  return (
    <Row>
      <Col span={24}>
        <CustomTable
          showColumnSetting={false}
          // scroll={{ x: 1080 }}
          // pagination={{
          //   pageSize: customer
          //     ? customer.contacts
          //       ? customer.contacts.length
          //       : 0
          //     : 0,
          //   total: customer
          //     ? customer.contacts
          //       ? customer.contacts.length
          //       : 0
          //     : 0,
          //   current: 1,
          //   showSizeChanger: true,
          //   // onChange: onPageChange,
          //   // onShowSizeChange: onPageChange,
          // }}
          pagination={false}
          dataSource={
            customerContactFiltered ? customerContactFiltered.reverse() : []
          }
          columns={columnFinal()}
          rowKey={(item: contact) => item.id}
          onRow={(record: CustomerContact) => {
            return {
              onClick: (event) => {
                setModalSingleContact(record);
                setModalAction("edit");
              }, // click row
            };
          }}
        />
        <CustomerModal
          createBtnTitle="Tạo mới thông tin liên hệ"
          updateBtnTitle="Lưu thông tin liên hệ"
          visible={isShowModalContacts}
          onCreate={(formValue: CustomerContact) =>
            handleContactForm.create(formValue)
          }
          onEdit={(formValue: CustomerContact) =>
            handleContactForm.edit(formValue)
          }
          onDelete={() => {}}
          onCancel={() => setIsShowModalContacts(false)}
          modalAction={modalAction}
          modalTypeText="Địa chỉ liên hệ"
          componentForm={FormCustomerContact}
          formItem={modalSingleContact}
          deletedItemTitle={modalSingleContact?.name}
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
        onCancel={onCancelContactDelete}
        onOk={onOkContactDelete}
        visible={isVisibleContactModal}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
        text="Bạn có chắc chắn xóa thông tin liên hệ này không?"
        icon={DeleteIcon}
      />
    </Row>
  );
}

export default CustomerContactInfo;
