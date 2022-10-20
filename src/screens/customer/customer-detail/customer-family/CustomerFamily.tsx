import React, { useEffect, useState } from "react";
import { Button, Card } from "antd";
import CustomTable from "component/table/CustomTable";
import { ICustomTableColumType } from "component/table/CustomTable";
import {
  createFamilyMemberAction,
  deleteFamilyMemberAction,
  updateFamilyMemberAction,
} from "domain/actions/customer/customer.action";
import { useDispatch } from "react-redux";
import { showSuccess, showError } from "utils/ToastUtils";
import { CustomerResponse } from "model/response/customer/customer.response";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { CustomerFamilyInfoResponse } from "model/customer/customer.response";
import CustomerFamilyFormModal from "./CustomerFamilyFormModal";
import { CustomerFamilyInfoRequest } from "model/customer/customer.request";
import { cloneDeep } from "lodash";
import { ACTION_TYPE, RELATION_LIST } from "screens/customer/helper";
import { GENDER_OPTIONS } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import CustomerFamilyActionColumn from "screens/customer/customer-detail/customer-family/CustomerFamilyActionColumn";
import { PlusOutlined } from "@ant-design/icons";

type CustomerFamilyProps = {
  customer: CustomerResponse;
};

const CustomerFamily: React.FC<CustomerFamilyProps> = (
  props: CustomerFamilyProps,
) => {
  const { customer } = props;
  const dispatch = useDispatch();

  const [actionType, setActionType] = React.useState<string>("");
  const [isShowModalFamily, setIsShowModalFamily] = React.useState(false);

  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const [familyMember, setFamilyMember] = useState<CustomerFamilyInfoResponse | null>(null);
  const [familyMemberIndex, setFamilyMemberIndex] = useState<number | null>(null);
  const [customerFamilyList, setCustomerFamilyList] = useState<Array<CustomerFamilyInfoResponse>>([]);
  
  useEffect(() => {
    if (customer && customer.family_info && Array.isArray(customer.family_info)) {
      setCustomerFamilyList(customer.family_info);
    }
  }, [customer]);

  const handleCreateFamilyInfo = () => {
    setActionType(ACTION_TYPE.CREATE);
    setIsShowModalFamily(true);
  };

  const handleEditFamilyInfo = (value: any, item: any, index: number) => {
    setActionType(ACTION_TYPE.UPDATE);
    setIsShowModalFamily(true);
    setFamilyMember(item);
    setFamilyMemberIndex(Number(index));
  };

  const handleDeleteFamilyInfo = (value: any, item: any, index: number) => {
    setIsShowConfirmDelete(true);
    setFamilyMember(item);
    setFamilyMemberIndex(Number(index));
  };

  const columns: Array<ICustomTableColumType<CustomerFamilyInfoResponse>> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value, row, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Tên người thân",
      dataIndex: "name",
      render: (value) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Mối quan hệ",
      dataIndex: "relation_type",
      align: "center",
      width: "200px",
      render: (value: string) => {
        const relation = RELATION_LIST.find(item => item.value === value);
        return <div>{relation?.label || value}</div>;
      },
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      align: "center",
      width: "200px",
      render: (value: string) => {
        const genderSelected = GENDER_OPTIONS.find(item => item.value === value);
        return <div>{genderSelected?.label || value}</div>;
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      align: "center",
      width: "200px",
      render: (value: string) => {
        return <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>;
      },
    },
    CustomerFamilyActionColumn(handleEditFamilyInfo, handleDeleteFamilyInfo),
  ];

  const createFamilyMemberCallback = (responseData: any) => {
    setActionType("");
    setIsShowModalFamily(false);
    if (responseData) {
      const newCustomerFamilyList = cloneDeep(customerFamilyList);
      newCustomerFamilyList.push(responseData)
      setCustomerFamilyList(newCustomerFamilyList);
      showSuccess("Thêm thông tin người thân thành công");
    } else {
      showError("Thêm thông tin người thân thất bại");
    }
  }

  const updateFamilyMemberCallback = (responseData: any) => {
    setActionType("");
    setIsShowModalFamily(false);
    if (responseData) {
      const newCustomerFamilyList = cloneDeep(customerFamilyList);
      if (typeof familyMemberIndex === "number") {
        newCustomerFamilyList[familyMemberIndex] = responseData;
        setCustomerFamilyList(newCustomerFamilyList);
      }
      showSuccess("Cập nhật thông tin người thân thành công");
    } else {
      showError("Cập nhật thông tin người thân thất bại");
    }
    setFamilyMemberIndex(null);
    setFamilyMember(null);
  }

  const deleteFamilyMemberCallback = (responseData: any) => {
    if (responseData) {
      const newCustomerFamilyList = cloneDeep(customerFamilyList);
      if (typeof familyMemberIndex === "number") {
        newCustomerFamilyList.splice(familyMemberIndex, 1);
        setCustomerFamilyList(newCustomerFamilyList);
      }
      showSuccess("Xóa thông tin người thân thành công");
    } else {
      showError("Xóa thông tin người thân thất bại");
    }
    setFamilyMemberIndex(null);
    setFamilyMember(null);
  }

  const familyMemberAction = {
    create: (formValue: CustomerFamilyInfoRequest) => {
      if (customer) {
        const memberInfoQuery = {
          ...formValue,
          customer_id: customer.id,
        }
        dispatch(
          createFamilyMemberAction(customer.id, memberInfoQuery, createFamilyMemberCallback),
        );
      }
    },
    update: (formValue: any) => {
      if (familyMember && customer) {
        const memberInfo = {
          ...familyMember,
          ...formValue,
        }
        dispatch(
          updateFamilyMemberAction(familyMember.id, customer.id, memberInfo, updateFamilyMemberCallback),
        );
      }
    },
    delete: () => {
      if (familyMember && customer) {
        dispatch(
          deleteFamilyMemberAction(familyMember.id, customer.id, deleteFamilyMemberCallback),
        );
      }
    },
  };
  
  const onOkModal = (value: CustomerFamilyInfoRequest) => {
    switch (actionType) {
      case ACTION_TYPE.CREATE:
        familyMemberAction.create(value);
        break;
      case ACTION_TYPE.UPDATE:
        familyMemberAction.update(value);
        break;
      default:
        break;
    }
  };

  const onCancelModal = () => {
    setActionType("");
    setIsShowModalFamily(false);
  };

  const onOkDeleteFamilyInfo = () => {
    setIsShowConfirmDelete(false);
    familyMemberAction.delete();
  };
  

  return (
    <>
      <Card
        title={"Danh sách người thân"}
        extra={
          <Button
            type={"primary"}
            icon={<PlusOutlined />}
            onClick={handleCreateFamilyInfo}
          >
            Thêm người thân
          </Button>
        }
        style={{ boxShadow: "none" }}
      >
        <CustomTable
          bordered={true}
          pagination={false}
          dataSource={customerFamilyList}
          columns={columns}
          rowKey={(record, index) => record.name + (index || 0)}
          style={{ margin: "20px 0" }}
        />
      </Card>

      <CustomerFamilyFormModal
        visible={isShowModalFamily}
        actionType={actionType}
        onCancelModal={onCancelModal}
        onOkModal={onOkModal}
        familyMemberInfo={familyMember}
      />

      <ModalDeleteConfirm
        visible={isShowConfirmDelete}
        onOk={onOkDeleteFamilyInfo}
        onCancel={() => setIsShowConfirmDelete(false)}
        title={
          <span>Bạn có chắc chắn muốn xóa <strong>{familyMember?.name}</strong> khỏi danh sách người thân?</span>
        }
      />
    </>
  );
};

export default CustomerFamily;
