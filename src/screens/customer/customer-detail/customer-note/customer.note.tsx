import { Row, Col } from "antd";
import CustomTable from "component/table/CustomTable";
import { ICustomTableColumType } from "component/table/CustomTable";
import CustomerModal from "../../customer-modal";
import {
  CreateNote,
  UpdateNote,
  DeleteNote,
} from "domain/actions/customer/customer.action";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess, showError } from "utils/ToastUtils";
import UrlConfig from "config/url.config";
import { note } from "model/response/customer/customer.response";
import { CustomerNote } from "model/request/customer.request";
import FormCustomerNote from "screens/customer/customer-detail/customer-note/note.form.modal";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import actionColumn from "../../common/action.column";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { modalActionType } from "model/modal/modal.model";
import { CustomerResponse } from "model/response/customer/customer.response";

type CustomerNoteInfoProps = {
  customer: CustomerResponse | undefined,
  customerDetailState: string,
  modalAction: modalActionType ,
  isShowModalNote: boolean,
  setIsShowModalNote: (value: boolean) => void,
  setModalAction: (value: modalActionType) => void,
}

const CustomerNoteInfo : React.FC<CustomerNoteInfoProps> = (props: CustomerNoteInfoProps) => {
  const {
    customer,
    customerDetailState,
    setModalAction,
    modalAction,
    isShowModalNote,
    setIsShowModalNote,
  } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const [modalSingleNote, setModalNote] = React.useState<CustomerNote>();
  const onCancelNoteDelete = () => {
    setIsVisibleNoteModal(false);
  };
  const [isVisibleNoteModal, setIsVisibleNoteModal] =
    React.useState<boolean>(false);

  const handleNoteEdit = () => {
    setIsShowModalNote(true);
  };
  const onOkNoteDelete = () => {
    handleNoteForm.delete();
    setIsVisibleNoteModal(false);
  };

  const handleNoteDelete = () => {
    setIsVisibleNoteModal(true);
  };
  const noteColumns: Array<ICustomTableColumType<note>> = [
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
      title: "Nội dung",
      dataIndex: "",
      visible: true,
      render: (value, row, index) => {
        return (
          <div style={{ color: "#666666", width: 300 }}>{row.content}</div>
        );
      },
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
      visible: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "content",
      visible: true,
      render: (value, row, index) => {
        return <span>{ConvertUtcToLocalDate(row.created_date)}</span>;
      },
    },
    {
      title: "Ngày sửa",
      dataIndex: "content",
      visible: true,
      render: (value, row, index) => {
        return <span>{ConvertUtcToLocalDate(row.updated_date)}</span>;
      },
    },
    {
      title: "Nguồn tạo",
      dataIndex: "created_source",
      visible: true,
    },
    actionColumn(handleNoteEdit, handleNoteDelete, customerDetailState),
  ];
  const noteColumnFinal = () =>
    noteColumns.filter((item) => item.visible === true);

  const handleNoteForm = {
    create: (formValue: CustomerNote) => {
      if (customer)
        dispatch(
          CreateNote(customer.id, formValue, (data: note) => {
            setIsShowModalNote(false);
            gotoFirstPage(customer.id);
            data
              ? showSuccess("Thêm mới ghi chú thành công")
              : showError("Thêm mới ghi chú thất bại");
          })
        );
    },
    edit: (formValue: CustomerNote) => {
      if (modalSingleNote) {
        if (customer)
          dispatch(
            UpdateNote(
              modalSingleNote.id,
              customer.id,
              formValue,
              (data: note) => {
                setIsShowModalNote(false);
                gotoFirstPage(customer.id);
                data
                  ? showSuccess("Cập nhật ghi chú thành công")
                  : showError("Cập nhật ghi chú thất bại");
              }
            )
          );
      }
    },
    delete: () => {
      if (modalSingleNote) {
        if (customer)
          dispatch(
            DeleteNote(modalSingleNote.id, customer.id, (data: note) => {
              setIsShowModalNote(false);
              gotoFirstPage(customer.id);
              data
                ? showSuccess("Xóa ghi chú thành công")
                : showError("Xóa ghi chú thất bại");
            })
          );
      }
    },
  };
  const gotoFirstPage = (customerId: any) => {
    history.replace(`${UrlConfig.CUSTOMER}/` + customerId + `#${customerDetailState}`);
  };
  return (
    <Row>
      <Col span={24}>
        <CustomTable
          showColumnSetting={false}
          pagination={false}
          dataSource={customer ? customer.notes.reverse() : []}
          columns={noteColumnFinal()}
          rowKey={(item: CustomerNote) => item.id}
          onRow={(record: CustomerNote) => {
            return {
              onClick: (event) => {
                setModalNote(record);
                setModalAction("edit");
                // setIsShowModalNote(true);
              }, // click row
            };
          }}
        />
        <CustomerModal
          createBtnTitle="Tạo mới ghi chú"
          updateBtnTitle="Lưu ghi chú"
          visible={isShowModalNote}
          onCreate={(formValue: CustomerNote) =>
            handleNoteForm.create(formValue)
          }
          onEdit={(formValue: CustomerNote) => handleNoteForm.edit(formValue)}
          onDelete={() => {}}
          onCancel={() => setIsShowModalNote(false)}
          modalAction={modalAction}
          modalTypeText="Ghi chú"
          componentForm={FormCustomerNote}
          formItem={modalSingleNote}
          deletedItemTitle={modalSingleNote?.content}
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
        onCancel={onCancelNoteDelete}
        onOk={onOkNoteDelete}
        visible={isVisibleNoteModal}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
        text="Bạn có chắc chắn xóa ghi chú này không?"
        icon={DeleteIcon}
      />
    </Row>
  );
}

export default CustomerNoteInfo;
