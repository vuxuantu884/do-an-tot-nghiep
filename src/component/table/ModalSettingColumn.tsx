import { useState, useCallback, useEffect } from "react";
import ReactCustomScrollbars from "react-custom-scrollbars";
import { Button, Checkbox, List, Modal } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";

import { ICustomTableColumType } from "./CustomTable";
import Undo from "assets/icon/undo.svg";

const ReactDragListView = require("react-drag-listview/lib/index");

export interface YodyColumn {}

type ModalSettingColumnType = {
  visible: boolean;
  isSetDefaultColumn?: boolean;
  onOk: (data: Array<ICustomTableColumType<any>>) => void;
  onCancel: () => void;
  data: Array<ICustomTableColumType<any>>;
};

const ModalSettingColumn: React.FC<ModalSettingColumnType> = (
  props: ModalSettingColumnType
) => {
  const { visible, isSetDefaultColumn, onOk, onCancel, data } = props;

  const [columns, setColumn] = useState<Array<ICustomTableColumType<any>>>([]);
  const onDrag = useCallback(
    (fromIndex, toIndex) => {
      if (toIndex < 0 || toIndex > columns.length - 1) return; // Ignores if outside designated area
      const items = [...columns];
      const item = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, item);
      setColumn(items);
    },
    [columns]
  );
  const onCheckedChange = useCallback(
    (index, e) => {
      if (index < 0 || index > columns.length - 1) return; // Ignores if outside designated area
      const items = [...columns];
      items[index] = { ...items[index], visible: e.target.checked };
      setColumn(items);
    },
    [columns]
  );

  const setDefaultColumn = useCallback(
    () => {
      const defautlColumns = [...columns];
      defautlColumns.forEach(column => {
        column.visible = true;
      })

      setColumn(defautlColumns);
      onOk(defautlColumns)
    },
    [columns, onOk]
  );

  useEffect(() => {
    setColumn(data);
  }, [data]);

  return (
    <Modal
      title="Cài đặt ẩn hiện cột"
      closable={false}
      visible={visible}
      onOk={() => onOk(columns)}
      onCancel={() => {
        setColumn(data);
        onCancel && onCancel();
      }}
      okText="Lưu"
      cancelText="Huỷ"
      footer={
        [
          <div
            style={{
              display: "flex",
              justifyContent: isSetDefaultColumn ? "space-between" : "flex-end"
            }}
          >
            { isSetDefaultColumn &&
              <Button key="return_default" icon={<img src={Undo} style={{ marginRight: 5 }} alt=""/>}  onClick={setDefaultColumn}>
                Quay về mặc định
              </Button>
            }

            <div>
              <Button key="on_cancel"  onClick={() => { setColumn(data); onCancel && onCancel(); }} >Huỷ</Button>
              <Button key="on_ok"  type="primary" onClick={() => onOk && onOk(columns)}>Lưu</Button>
            </div>
          </div>
        ]
      }
    >
      <p>Kéo thả chuột để lựa chọn cột theo trình tự bạn mong muốn.</p>
      <ReactCustomScrollbars style={{ height: "300px" }} autoHide>
        <ReactDragListView
          onDragEnd={onDrag}
          nodeSelector=".ant-list-item.draggble"
        >
          <List.Item className={"draggble"} key="select-all">
            <Checkbox >Chọn tất cả</Checkbox>
          </List.Item>
          <List
            dataSource={columns}
            renderItem={(item, index) => (
              <List.Item
                key={item.key}
                className={"draggble"}
                actions={[
                  <Button
                    onClick={() => {
                      onDrag(index, index + 1);
                    }}
                    key="icon-move-down"
                    icon={<ArrowDownOutlined />}
                  />,
                  <Button
                    onClick={() => {
                      onDrag(index, index - 1);
                    }}
                    key="icon-move-up"
                    icon={<ArrowUpOutlined />}
                  />,
                ]}
              >
                <Checkbox
                  onChange={(e) => onCheckedChange(index, e)}
                  checked={item.visible}
                >
                  {item.title}
                </Checkbox>
              </List.Item>
            )}
          />
        </ReactDragListView>
      </ReactCustomScrollbars>
    </Modal>
  );
};

export default ModalSettingColumn;
