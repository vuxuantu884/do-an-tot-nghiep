import {Table, Modal, Input, Row, Col} from "antd";
import {CreateOrderReturnContext} from "contexts/order-return/create-order-return";
import React, {useContext, useEffect, useState} from "react";
import "assets/css/_modal.scss";
import {StoreResponse} from "model/core/store.model";
import { fullTextSearch } from "utils/StringUtils";

type StoreReturnModelProps = {
  isModalVisible: boolean;
  handleCancel: () => void;
  setModalVisible:(value:boolean)=>void;
};

const {Search} = Input;

export interface StoreModel {
  key: number;
  store_id: number;
  store_name: string;
}

const StoreReturnModel: React.FC<StoreReturnModelProps> = (
  props: StoreReturnModelProps
) => {
  const {isModalVisible,setModalVisible, handleCancel} = props;

  const createOrderReturnContext = useContext(CreateOrderReturnContext);
  const [data, setData] = useState<StoreModel[]>([]);
  const [selectStore, setSelectStore] = useState<StoreResponse | null>(null);

  const listStoreReturn = createOrderReturnContext?.listStoreReturn;
  //const setStoreReturn= createOrderReturnContext?.return.setStoreReturn;

  useEffect(() => {
    if (listStoreReturn) {
      let result: StoreModel[] = [];
      listStoreReturn.forEach(function (item, index) {
        result.push({
          key: index,
          store_id: item.id,
          store_name: item.name,
        });
      });
      setData(result);
    }
  }, [listStoreReturn]);

  const columns = [
    {
      title: "Cửa hàng",
      dataIndex: "store_name",
      with: "85%",
      render: (value: string, i: StoreModel) => {
        return (
          <div>
            {i.store_id} - {value}
          </div>
        );
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      let _item: StoreResponse | null|undefined = listStoreReturn?.find(
        (x) => x.id === selectedRows[0].store_id
      );
      if(_item)
      setSelectStore(_item);
    },
  };

  const handleSearchStore = (value: any) => {
    if (listStoreReturn) {
      let query = value.trim();
      let newData: StoreResponse[] = listStoreReturn.filter(function (el) {
        return fullTextSearch(query, el.name)
      });

      let result: StoreModel[] = [];
      newData.forEach(function (item, index) {
        result.push({
          key: index,
          store_id: item.id,
          store_name: item.name,
        });
      });
      setData(result);
    }
  };


  return (
    <>
      <Modal
        title="Chọn kho cần trả hàng"
        visible={isModalVisible}
        onOk={()=>{
            createOrderReturnContext?.return.setStoreReturn(selectStore);
            setModalVisible(false);
        }}
        onCancel={handleCancel}
        width={500}
        className="store-return-modal"
      >
        <Row className="search-store-input">
          <Col md={24}>
            <Search
              placeholder="Tìm kiếm tên cửa hàng"
              allowClear
              onSearch={handleSearchStore}
              onChange={(e: any) => {
                handleSearchStore(e.target.value);
              }}
              style={{width: "60%", float: "right"}}
            />
          </Col>
        </Row>
        <Row>
          <Col md={24}>
            <Table
              scroll={{y: 500}}
              rowSelection={{
                type: "radio",
                columnWidth: 50,
                ...rowSelection,
              }}
              columns={columns}
              dataSource={data}
              pagination={false}
            />
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default StoreReturnModel;
