import React, { useState } from "react";
import { Card, Collapse, Button } from "antd";

import { CustomerFamilyInfoResponse } from "model/customer/customer.response";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import CustomerFamilyFormModal from "screens/customer/customer-detail/customer-family/CustomerFamilyFormModal";
import { CustomerFamilyInfoRequest } from "model/customer/customer.request";
import { cloneDeep } from "lodash";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { GENDER_OPTIONS } from "utils/Constants";
import { ACTION_TYPE, RELATION_LIST } from "screens/customer/helper";
import CustomerFamilyActionColumn from "screens/customer/customer-detail/customer-family/CustomerFamilyActionColumn";

const { Panel } = Collapse;

type CustomerFamilyInfoProps = {
  customerFamilyList: Array<CustomerFamilyInfoRequest>;
  setCustomerFamilyList: (customerFamilyList: Array<CustomerFamilyInfoRequest>) => void;
}

function CustomerFamilyInfo(props: CustomerFamilyInfoProps) {
  const { customerFamilyList, setCustomerFamilyList } = props;

  const [actionType, setActionType] = React.useState<string>("");
  const [isShowModalFamily, setIsShowModalFamily] = useState<boolean>(false);
  const [familyMember, setFamilyMember] = useState<CustomerFamilyInfoResponse | null>(null);
  const [familyMemberIndex, setFamilyMemberIndex] = useState<number | null>(null);

  const [isCollapseActive, setCollapseActive] = React.useState<boolean>(true);
  const onChangeCollapse = () => {
    setCollapseActive(!isCollapseActive);
  };

  const handleEditFamilyInfo = (value: any, item: any, index: number) => {
    setActionType(ACTION_TYPE.UPDATE);
    setIsShowModalFamily(true);
    setFamilyMember(item);
    setFamilyMemberIndex(Number(index));
  };

  const handleDeleteFamilyInfo = (value: any, item: any, index: number) => {
    const newCustomerFamilyList = cloneDeep(customerFamilyList);
    newCustomerFamilyList.splice(index, 1);
    setCustomerFamilyList(newCustomerFamilyList);
  };

  const columns: Array<ICustomTableColumType<any>> = [
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


  const createFamilyMemberInfo = (value: CustomerFamilyInfoRequest) => {
    const newCustomerFamilyList = cloneDeep(customerFamilyList);
    newCustomerFamilyList.push(value);
    setCustomerFamilyList(newCustomerFamilyList);
    setActionType("");
    setIsShowModalFamily(false);
  }
  
  const updateFamilyMemberInfo = (value: CustomerFamilyInfoRequest) => {
    if (typeof familyMemberIndex === "number") {
      const newCustomerFamilyList = cloneDeep(customerFamilyList);
      newCustomerFamilyList[familyMemberIndex] = value;
      setCustomerFamilyList(newCustomerFamilyList);
    }
    setActionType("");
    setIsShowModalFamily(false);
    setFamilyMember(null);
    setFamilyMemberIndex(null);
  }

  const onOkModal = (value: CustomerFamilyInfoRequest) => {
    switch (actionType) {
      case ACTION_TYPE.CREATE:
        createFamilyMemberInfo(value);
        break;
      case ACTION_TYPE.UPDATE:
        updateFamilyMemberInfo(value);
        break;
      default:
        break;
    }
  };

  const onCancelModal = () => {
    setActionType("");
    setIsShowModalFamily(false);
  };
  

  return (
    <Card className="customer-contact">
      <Collapse
        onChange={onChangeCollapse}
        expandIconPosition="right"
        activeKey={[isCollapseActive ? "1" : ""]}
      >
        <Panel
          header={<span className="card-title">THÔNG TIN NGƯỜI THÂN</span>}
          key="1"
        >
          <CustomTable
            bordered={true}
            pagination={false}
            dataSource={customerFamilyList}
            columns={columns}
            rowKey={(item: any) => item.id}
          />

          <Button
            type="default"
            onClick={() => {
              setActionType(ACTION_TYPE.CREATE);
              setIsShowModalFamily(true);
            }}
            style={{ marginTop: "20px" }}
          >
            Thêm người thân
          </Button>
        </Panel>
      </Collapse>

      <CustomerFamilyFormModal
        visible={isShowModalFamily}
        actionType={actionType}
        onCancelModal={onCancelModal}
        onOkModal={onOkModal}
        familyMemberInfo={familyMember}
      />
    </Card>
  );
}

export default CustomerFamilyInfo;
