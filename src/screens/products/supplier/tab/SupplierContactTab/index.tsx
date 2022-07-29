import { Button, Dropdown, Menu } from "antd";
import CustomTable from "component/table/CustomTable";
import { SupplierContact, SupplierContactResposne } from "model/core/supplier.model";
import threeDot from "assets/icon/three-dot.svg";

type SupplierContactTabProps = {
  data: Array<SupplierContactResposne>;
  loading: boolean;
  onDetail: (data: SupplierContactResposne) => void;
  onDefault: (addressId: number, data: SupplierContact) => void;
  onDelete: (addressId: number) => void;
};

const SupplierContactTab: React.FC<SupplierContactTabProps> = (props: SupplierContactTabProps) => {
  const { data, loading, onDetail, onDefault, onDelete } = props;
  return (
    <CustomTable
      isLoading={loading}
      style={{ marginTop: "10px" }}
      pagination={false}
      dataSource={data}
      rowKey={(data) => data.id}
      isRowSelection
      columns={[
        {
          title: "Tên liên hệ",
          dataIndex: "name",
        },
        {
          title: "Chức vụ",
          dataIndex: "position",
        },
        {
          title: "Số điện thoại",
          dataIndex: "phone",
        },
        {
          title: "Fax",
          dataIndex: "fax",
        },
        {
          title: "Email",
          dataIndex: "email",
        },
        {
          title: "Website",
          dataIndex: "website",
        },

        {
          title: <div style={{ textAlign: "center" }}>Thao tác</div>,
          dataIndex: "id",
          render: (value: number, record: SupplierContactResposne, index: number) => {
            const menu = (
              <Menu
                onClick={(info) => {
                  switch (info.key) {
                    case "1":
                      let supplier: SupplierContact = {
                        ...record,
                        is_default: true,
                      };
                      onDefault && onDefault(value, supplier);
                      break;
                    case "2":
                      onDetail(record);
                      break;
                    case "3":
                      onDelete(value);
                      break;
                  }
                }}
              >
                <Menu.Item disabled={record.is_default} key="1">
                  Đặt làm địa chỉ mặc định
                </Menu.Item>
                <Menu.Item key="2">Chỉnh sửa</Menu.Item>
                <Menu.Item key="3">Xóa</Menu.Item>
              </Menu>
            );
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                  <Button
                    style={{
                      width: 30,
                      height: 30,
                      lineHeight: "20px",
                      padding: 0,
                    }}
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
        {
          title: "",
          width: 100,
          dataIndex: "is_default",
          render: (value) => value && <span className="text-success">Mặc định</span>,
        },
      ]}
    />
  );
};

export default SupplierContactTab;
