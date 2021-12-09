import { Button, Dropdown, Menu } from "antd";
import CustomTable from "component/table/CustomTable";
import { SupplierPaymentResposne } from "model/core/supplier.model";
import threeDot from "assets/icon/three-dot.svg";

type SupplierContactTabProps = {
  data: Array<SupplierPaymentResposne>;
  loading: boolean;
  onDetail: (data: SupplierPaymentResposne) => void;
  onDelete: (paymentId: number) => void;
};


const SupplierPaymentTab: React.FC<SupplierContactTabProps> = (props: SupplierContactTabProps) => {
  const {data, onDetail, onDelete, loading} = props;
  return (
    <CustomTable
      isLoading={loading}
      style={{marginTop: "10px"}}
      pagination={false}
      dataSource={data}
      rowKey={(data) => data.id}
      isRowSelection
      columns={[
        {
          title: "Tên",
          dataIndex: "name",
        },
        {
          title: "Chi nhánh",
          dataIndex: "brand",
        },
        {
          title: "Số tài khoản",
          dataIndex: "number",
        },
        {
          title: "Người thụ hưởng",
          dataIndex: "beneficiary",
        },
        {
          title: <div style={{textAlign: 'center'}}>Thao tác</div>,
          dataIndex: "id",
          render: (value: number, record: SupplierPaymentResposne, index: number) => {
            const menu = (
              <Menu onClick={(info) => {
                switch(info.key) {
                  case '1':
                    onDetail(record);
                    break;
                  case '2':
                    onDelete(value);
                    break;
                }
              }} >
                <Menu.Item key="1">Chỉnh sửa</Menu.Item>
                <Menu.Item  key="2">Xóa</Menu.Item>
              </Menu>
            );
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                  <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                    <Button
                      style={{width: 30, height: 30, lineHeight: '20px', padding: 0}}
                      icon={<img src={threeDot} alt=""></img>}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </Dropdown>
              </div>
            );
          },
        },
      ]}
    />
  )
};

export default SupplierPaymentTab;