import { PlusSquareOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Col, FormInstance, Row, Select,Form } from "antd";
import { createRef, useCallback, useContext, useState } from "react";
// import { useDispatch } from "react-redux";
import ReportHandOverModal from "../modal/report-hand-over.modal";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { createGoodsReceipts } from "domain/actions/goods-receipts/goods-receipts.action";
import { useDispatch } from "react-redux";
import { removePackInfo } from "utils/LocalStorageUtils";

const ReportHandOver: React.FC = () => {
  const dispatch = useDispatch();

  //useState
  const [visibleModal, setVisibleModal] = useState(false);
  const formRef = createRef<FormInstance>();
  const [goodsReceiptsForm] = Form.useForm();

  //Context
  const orderPackContextData = useContext(OrderPackContext);
  const data=orderPackContextData.data;
  const listStores = orderPackContextData.listStores;
  const listChannels=orderPackContextData.listChannels;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;
  const listGoodsReceipts= orderPackContextData.listGoodsReceipts;
  const setData= orderPackContextData.setData;

  const handleOk = () => {
    goodsReceiptsForm.submit();
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setVisibleModal(false);
  };

  const showModal = () => {
    setVisibleModal(true);
  };

  const handSubmit = useCallback((value:any) => {
    let codes: any[] = [];
    let store_name=listStores.find((data) => data.id === value.store_id )?.name;

    let ecommerce_name="Biên bản đơn tự tạo";
    if(value!==-1)
    {
      let changeName=listChannels.find((data)=>data.id===value.ecommerce_id)?.name;
      ecommerce_name=changeName?changeName:"Biên bản đơn tự tạo";
    }
    
    let delivery_service_name=listThirdPartyLogistics.find((data)=> data.id===value.delivery_service_id)?.name;
    let receipt_type_name=listGoodsReceipts.find((data)=>data.id===value.receipt_type_id)?.name;

    data.items.forEach(function (i: any) {
      codes.push(i.code);
    });

    let param:any={
      ...value,
      store_name: store_name,
      ecommerce_name: ecommerce_name,
      delivery_service_name: delivery_service_name,
      receipt_type_name: receipt_type_name,
      codes:codes
    }

    dispatch(createGoodsReceipts(param, (value:any)=>{
      console.log("Goods",value)
      removePackInfo();
      setData({
        metadata: {
          limit: 1,
          page: 1,
          total: 0,
        },
        items: [],
      })
    }));
  },[dispatch,setData, data,listGoodsReceipts,listStores,listThirdPartyLogistics,listChannels])

  return (
    <Card
      title="Cho vào biên bản bàn giao"
      bordered={false}
      style={{paddingLeft: "18px", paddingRight:"18px"}}
    >
      <div>
        <Row gutter={24}>
          <Col md={8} sm={24}>
            <Select
              className="select-with-search"
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn biên bản"
              notFoundContent="Không tìm thấy kết quả"
              onChange={(value?: number) => {
                console.log(value);
              }}
              filterOption={(input, option) => {
                if (option) {
                  return (
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  );
                }
                return false;
              }}
            >
              {/* {dataCanAccess.map((item, index) => (
                  <Select.Option key={index.toString()} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))} */}
              <Select.Option key={0} value={1}>
                -- chon --
              </Select.Option>
            </Select>
          </Col>
          <Col md={3}>
            <Button icon={<PlusSquareOutlined />} size="large" block onClick={showModal}>
              Thêm mới
            </Button>
          </Col>
          <Col md={2}>
            <Button type="primary" icon={<SaveOutlined />} size="large" block>
              Lưu
            </Button>
          </Col>
        </Row>
      </div>
      <ReportHandOverModal visible={visibleModal} formRef={formRef} goodsReceiptsForm={goodsReceiptsForm} handSubmit={handSubmit} handleOk={handleOk} handleCancel={handleCancel} />
    </Card>
  );
};

export default ReportHandOver;
