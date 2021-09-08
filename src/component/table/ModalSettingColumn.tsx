import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Checkbox, List, Modal } from "antd";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import ReactCustomScrollbars from "react-custom-scrollbars";
import { ICustomTableColumType } from "./CustomTable";
const ReactDragListView = require("react-drag-listview/lib/index");

export interface YodyColumn {}

type ModalSettingColumnType = {
  visible: boolean;
  onOk: (data: Array<ICustomTableColumType<any>>) => void;
  onCancel: () => void;
  data: Array<ICustomTableColumType<any>>;
};

const ModalSettingColumn: React.FC<ModalSettingColumnType> = (
  props: ModalSettingColumnType
) => {
  const { visible, onOk, onCancel, data } = props;
  const [columns, setColumn] = useState<Array<ICustomTableColumType<any>>>([]);
  const onDrag = useCallback(
    (fromIndex, toIndex) => {
      if (toIndex < 0 || toIndex > columns.length - 1) return; // Ignores if outside designated area
      const items = [...JSON.parse(JSON.stringify(columns))];
      const item = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, item);
      setColumn(items);
    },
    [columns]
  );
  const onCheckedChange = useCallback(
    (index, e) => {
      if (index < 0 || index > columns.length - 1) return; // Ignores if outside designated area
      const items = [...JSON.parse(JSON.stringify(columns))];
      items[index].visible = e.target.checked;
      setColumn(items);
    },
    [columns]
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
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Huỷ"
    >
      <p>Kéo thả chuột để lựa chọn cột theo trình tự bạn mong muốn.</p>
      <ReactCustomScrollbars style={{ height: '450px' }} autoHide>
        <ReactDragListView
          onDragEnd={onDrag}
          nodeSelector=".ant-list-item.draggble"
        >
          <List
            dataSource={columns}
            renderItem={(item, index) => (
              <List.Item
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
