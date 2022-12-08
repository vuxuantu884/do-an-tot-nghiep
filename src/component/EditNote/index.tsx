import { EditOutlined } from "@ant-design/icons";
import { Button, Input, Popover } from "antd";
import React, { ReactNode, useEffect, useState } from "react";

type EditNoteProps = {
  note: string;
  title?: string;
  color?: string;
  isDisable?: boolean;
  isGroupButton?: boolean;
  isHaveEditPermission?: boolean;
  defaultNote?: ReactNode;
  onOk: (newNote: string) => void;
};
const EditNote: React.FC<EditNoteProps> = (props: EditNoteProps) => {
  const {
    note,
    title,
    defaultNote,
    onOk,
    isDisable = false,
    isGroupButton = false,
    isHaveEditPermission = true,
    color,
  } = props;
  const [visible, setVisible] = useState(false);
  const [newNote, setNewNote] = useState(note);

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const changeNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value);
  };

  useEffect(() => {
    setNewNote(note);
  }, [note]);

  return (
    <div className="wrapper">
      <div style={{ display: "flex", flexWrap: "wrap" }}>{defaultNote}</div>

      <Popover
        content={
          <div>
            <Input.TextArea
              value={newNote}
              onChange={(e) => changeNote(e)}
              style={{ width: 300 }}
              disabled={isDisable}
            />
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="primary"
                style={{ marginRight: 10 }}
                onClick={() => {
                  onOk(newNote);
                  setVisible(false);
                }}
                disabled={isDisable}
              >
                Lưu
              </Button>
              <Button
                onClick={() => {
                  setNewNote(note);
                  setVisible(false);
                }}
              >
                Huỷ
              </Button>
            </div>
          </div>
        }
        title="Sửa ghi chú"
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
      >
        {!isGroupButton && isHaveEditPermission && (
          <EditOutlined
            style={{ marginRight: 5, color, cursor: "pointer" }}
            title="Sửa ghi chú"
          />
        )}

        {isGroupButton && (
          <Button className="custom-group-btn">
            <>
              <EditOutlined style={{ marginRight: 5, color }} title="Sửa ghi chú" />
              <span>
                {title && <strong>{title}</strong>}
                <span>{note}</span>
              </span>
            </>
          </Button>
        )}
      </Popover>

      {!isGroupButton && (
        <span>
          {title && <strong>{title}</strong>}
          <span>{note}</span>
        </span>
      )}
    </div>
  );
};

export default EditNote;
