import { Divider, Input, Tag } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { StyledComponent } from "./styles";
import {
  addUnichatCustomerNote,
  deleteUnichatCustomerNote,
  updateUnichatCustomerNote,
} from "screens/yd-page/helper";
import { showError, showSuccess } from "utils/ToastUtils";
import { ICustomerNoteTags } from "screens/yd-page";
import { v4 as uuidv4 } from "uuid";

interface IUnichatCustomerNote {
  fbCustomerId: string;
  userId: string;
  customerNoteTags: ICustomerNoteTags[];
  setCustomerNoteTags: React.Dispatch<React.SetStateAction<ICustomerNoteTags[]>>;
}

const UnichatCustomerNote = ({
  fbCustomerId,
  userId,
  customerNoteTags,
  setCustomerNoteTags,
}: IUnichatCustomerNote) => {
  const [inputVisible, setInputVisible] = useState(false);
  const [editInputVisible, setEditInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef<Input>(null);
  const editInputRef = useRef<Input>(null);

  useEffect(() => {
    if (inputVisible && !editInputVisible) {
      inputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [inputValue, editInputVisible]);

  const handleClose = useCallback(
    async (e: React.MouseEvent<HTMLElement>, removedNoteTag: ICustomerNoteTags) => {
      const errorText = "Xóa ghi chú thất bại";
      if (!fbCustomerId) {
        showError("Không tồn tại sender_id");
        return;
      }
      if (!removedNoteTag._id) {
        e.preventDefault();
        showError(errorText);
        return;
      }
      const res = await deleteUnichatCustomerNote(fbCustomerId, removedNoteTag._id);
      if (!res || (res.data && res.data.error && res.data.error.code === 400)) {
        e.preventDefault();
        showError(res?.data?.error?.message || errorText);
        return;
      }
      const newNoteTags = [...customerNoteTags].filter(
        (noteTag) => noteTag._id !== removedNoteTag._id,
      );
      setCustomerNoteTags(newNoteTags);
      showSuccess("Xóa ghi chú thành công");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerNoteTags, fbCustomerId],
  );

  const showInput = useCallback(() => {
    setInputVisible(true);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputConfirm = useCallback(async () => {
    setInputVisible(false);
    setInputValue("");
    if (!fbCustomerId) {
      showError("Không tồn tại sender_id");
      return;
    }
    if (!userId) {
      showError("Không tồn tại userId");
      return;
    }
    const inputValueTrim = inputValue.trim();
    if (!inputValueTrim) return;
    const newNoteTag: ICustomerNoteTags = {
      _id: uuidv4(),
      created_at: new Date(),
      created_by: userId,
      content: inputValueTrim,
    };
    const res = await addUnichatCustomerNote(fbCustomerId, newNoteTag);
    if (!res) {
      showError("Thêm ghi chú thất bại");
      return;
    }
    const newNoteTagList = [newNoteTag, ...customerNoteTags];
    setCustomerNoteTags(newNoteTagList);
    showSuccess("Thêm ghi chú thành công");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, userId, fbCustomerId, customerNoteTags]);

  const handleEditInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  }, []);

  const handleEditInputConfirm = useCallback(async () => {
    setEditInputVisible(false);
    setEditInputIndex(-1);
    setInputValue("");
    if (!fbCustomerId) {
      showError("Không tồn tại sender_id");
      return;
    }
    if (!userId) {
      showError("Không tồn tại userId");
      return;
    }
    const newNoteTags = [...customerNoteTags];
    const errorMessage = "Sửa ghi chú thất bại";
    const currentNoteValue = newNoteTags[editInputIndex];
    if (!currentNoteValue || !currentNoteValue._id) {
      showError(errorMessage);
      return;
    }
    const editInputValueTrim = editInputValue.trim();
    if (!editInputValueTrim || editInputValueTrim === currentNoteValue.content) return;

    const updateNoteData = {
      idNoteTag: currentNoteValue._id,
      updated_at: new Date(),
      updated_by: userId,
      content: editInputValueTrim,
    };
    const res = await updateUnichatCustomerNote(fbCustomerId, updateNoteData);
    if (!res || (res.data && res.data.error && res.data.error.code === 400) || res.message) {
      const errorText = res?.data?.error?.message || res?.message || errorMessage;
      showError(errorText);
      return;
    }
    currentNoteValue.content = editInputValueTrim;
    setCustomerNoteTags(newNoteTags);
    showSuccess("Sửa ghi chú thành công");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerNoteTags, editInputIndex, editInputValue, fbCustomerId, userId]);

  return (
    <StyledComponent>
      <Divider style={{ margin: "12px 0px" }} />
      <div className="unichat-customer-note">
        {inputVisible && (
          <Input
            ref={inputRef}
            type="text"
            size="small"
            className="tag-input"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag className="new-note-tag" onClick={showInput}>
            <PlusOutlined /> Thêm ghi chú
          </Tag>
        )}

        {customerNoteTags.map((noteTag, index) => {
          if (editInputIndex === index) {
            return (
              <Input
                ref={editInputRef}
                key={noteTag._id || noteTag.content + index}
                size="small"
                className="tag-input"
                value={editInputValue}
                onChange={handleEditInputChange}
                onBlur={handleEditInputConfirm}
                onPressEnter={handleEditInputConfirm}
              />
            );
          }

          return (
            <Tag
              className="edit-tag"
              key={noteTag._id || noteTag.content + index}
              closable={true}
              onClose={(e) => handleClose(e, noteTag)}
            >
              <span
                onDoubleClick={(e) => {
                  setEditInputIndex(index);
                  setEditInputValue(noteTag.content);
                  setEditInputVisible(true);
                  e.preventDefault();
                }}
              >
                {noteTag.content}
              </span>
            </Tag>
          );
        })}
      </div>
    </StyledComponent>
  );
};

export default UnichatCustomerNote;
