import { useState, useCallback, useEffect } from "react";
import ReactCustomScrollbars from "react-custom-scrollbars";
import { Button, Checkbox, List, Modal } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";

import { ICustomTableColumType } from "./CustomTable";
import Undo from "assets/icon/undo.svg";
import "./modal-setting-column.scss";


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
  const [isSelectAll, setIsSelectAll] = useState(false);

  const onDrag = useCallback(
    (fromIndex, toIndex) => {
      if (toIndex < 0 || toIndex > columns.length - 1) return; // Ignores if outside designated area
      const items = [...columns];
      if (items[fromIndex].fixed || items[toIndex].fixed) return;

      const item = items.splice(fromIndex, 1)[0];
      items.splice(toIndex, 0, item);
      setColumn(items);
    },
    [columns]
  );

  const checkSelectAll = (columns: any) => {
    let isCheckSelectAll = true;
    columns.forEach((column: { visible: boolean; }) => {
      if (column.visible === false) {
        isCheckSelectAll = false;
      }
    })

    setIsSelectAll(isCheckSelectAll);
  };

  const onCheckedChange = useCallback(
    (index, e) => {
      if (index < 0 || index > columns.length - 1) return; // Ignores if outside designated area
      const items = [...columns];
      items[index] = { ...items[index], visible: e.target.checked };
      setColumn(items);
      checkSelectAll(items);
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

  const onCancelSetColumn = useCallback(
    () => {
      setColumn(data);
      onCancel && onCancel();
    },
    [data, onCancel]
  );

  const onSelectAllChange = (e: any) => {
    const { checked } = e.target
    const copyColumns = [...columns];

    copyColumns.forEach((item, index) => {
      copyColumns[index] = { ...copyColumns[index], visible: item.fixed ? true : checked };
    })

    setIsSelectAll(checked);
    setColumn(copyColumns);
  }

  const okButtonDisable  = () => {
    let columnChecked = columns.filter((column) => {
      return column.visible === true;
    });

    return (columnChecked.length === 0);
  }

  useEffect(() => {
    setColumn(data);
    checkSelectAll(data);
  }, [data]);

  return (
    <Modal
      title="Cài đặt ẩn hiện cột"
      closable={false}
      visible={visible}
			onCancel={onCancel}
      footer={
        [
          <div
            key="footer-button-list"
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
              <Button key="on_cancel" onClick={onCancelSetColumn}>Huỷ</Button>
              <Button key="on_ok"  type="primary" disabled={okButtonDisable()} onClick={() => onOk && onOk(columns)}>Lưu</Button>
            </div>
          </div>
        ]
      }
    >
      <p>Kéo thả chuột để lựa chọn cột theo trình tự bạn mong muốn.</p>
      {columns.filter(item => item.fixed).length > 0 && <p>Bạn không thể thay đổi các cột đã được cố định.</p>}
      <ReactCustomScrollbars style={{ height: "300px" }} autoHide>
        <ReactDragListView
          onDragEnd={onDrag}
          nodeSelector="li.ant-list-item.draggble-setting-column"
          handleSelector="li.ant-list-item.draggble-setting-column"
        >
          <List.Item className={"draggble"} key="select-all">
            <Checkbox  key="checkbox-select-all" checked={isSelectAll} onChange={(e) => onSelectAllChange(e)}>Chọn tất cả</Checkbox>
          </List.Item>
          <List
            dataSource={columns}
            renderItem={(item, index) => (
              <List.Item
                key={item.key}
                className={"draggble-setting-column"}
                actions={[
                  <Button
                    onClick={() => {
                      onDrag(index, index + 1);
                    }}
                    key="icon-move-down"
                    icon={<ArrowDownOutlined />}
                    disabled={Boolean(item.fixed)}
                  />,
                  <Button
                    onClick={() => {
                      onDrag(index, index - 1);
                    }}
                    key="icon-move-up"
                    icon={<ArrowUpOutlined />}
                    disabled={Boolean(item.fixed)}
                  />,
                ]}
              >
                <Checkbox
                  onChange={(e) => onCheckedChange(index, e)}
                  checked={item.visible}
                  disabled={Boolean(item.fixed)}
                >
                  {item.titleCustom ?? item.title}
                  <span style={{ color: '#2a2a86', fontWeight: 500, marginLeft: '30px' }}>{item.fixed ? 'Cố định' : ''}</span>
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


