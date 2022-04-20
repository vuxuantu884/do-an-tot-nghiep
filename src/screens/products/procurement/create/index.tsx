import { Button, Card, Form, Space } from "antd"
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container"
import ModalConfirm from "component/modal/ModalConfirm";
import UrlConfig from "config/url.config";
import arrowLeft from "assets/icon/arrow-back.svg";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ProcurementForm from "./components/ProcurementForm";
import ProcurementResult from "./components/ProcurementResult";
import ProcurementScanResult from "./components/ProcurementScanResult";
import { ProcurementCreate } from "model/procurement";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { isEmpty } from "lodash";
import { ProcurementField } from "model/procurement/field";


const ProcurementCreateScreen: React.FC = () => {
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [dataResult, setDataResult] = useState<ProcurementCreate>()
  const [listPO, setListPO] = useState<Array<PurchaseOrder>>([])
  const history = useHistory()

  const [formMain] = Form.useForm()

  return (
    <ContentContainer
      title="Tạo phiếu nhập kho"
      breadcrumb={[
        {
          name: "Nhập kho",
          path: `${UrlConfig.PROCUREMENT}`,
        },
        {
          name: "Thêm mới phiếu nhập kho",
        },
      ]}
    >
      <Form form={formMain} >
        <Card>
          <ProcurementForm formMain={formMain} setDataResult={setDataResult} setListPO={setListPO} />
          {!isEmpty(dataResult) && <ProcurementScanResult dataResult={dataResult} />}
        </Card>
        {!isEmpty(listPO) && <Card>
          <ProcurementResult formMain={formMain} listPO={listPO} />
        </Card>}

      </Form>
      {isVisibleModalWarning && (
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalWarning(false);
          }}
          onOk={() => history.push(`${UrlConfig.PROCUREMENT}`)}
          okText="Đồng ý"
          cancelText="Tiếp tục"
          title={`Bạn có muốn rời khỏi trang?`}
          subTitle="Thông tin trên trang này sẽ không được lưu."
          visible={isVisibleModalWarning}
        />
      )}
      <BottomBarContainer
        leftComponent={
          <div
            onClick={() => {
              let supplier_id = formMain.getFieldsValue([ProcurementField.supplier_id])
              let store_id = formMain.getFieldsValue([ProcurementField.store_id])
              let file = formMain.getFieldsValue([ProcurementField.file])
              if (supplier_id !== undefined || store_id !== undefined || file !== undefined) {
                setIsVisibleModalWarning(true)
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            {"Quay lại danh sách"}
          </div>
        }
        rightComponent={
          <Space>
            <Button
              type="primary"
              onClick={() => history.push(`${UrlConfig.PROCUREMENT}`)}
            >
              Xem danh sách phiếu
            </Button>
          </Space>
        }
      />
    </ContentContainer>
  )
}

export default ProcurementCreateScreen
