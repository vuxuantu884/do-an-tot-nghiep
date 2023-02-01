import { EditOutlined } from "@ant-design/icons";
import { Button, Popover } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { KeyboardKey } from "model/other/keyboard/keyboard.model";
import React, { useCallback, useEffect, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { EditDefectWrapper } from "./style";

type EditDefectProps = {
  value: number;
  title?: string;
  color?: string;
  isDisable?: boolean;
  isHaveEditPermission?: boolean;
  confirmEdit: (value: number) => void;
  label?: string;
  isRequire?: boolean;
  errorMessage?: string;
  index: number;
};

const EditDefect: React.FC<EditDefectProps> = (props) => {
  const {
    value,
    title,
    confirmEdit,
    isDisable = false,
    label,
    isHaveEditPermission = true,
    isRequire,
    errorMessage = "",
    index,
  } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [newValue, setNewValue] = useState<number>(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisible) {
      setNewValue(value);
      setTimeout(() => {
        const input = document.querySelector(`.number-defect-${index}`) as HTMLInputElement;
        const x = window.scrollX;
        const y = window.scrollY;
        input.focus();
        input.select();
        window.scrollTo(x, y);
      }, 0);
    }
  }, [index, isVisible, value]);

  const cancelEdit = useCallback(() => {
    setNewValue(value);
    setIsVisible(false);
    setError("");
  }, [value]);

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === KeyboardKey.Escape) {
        cancelEdit();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [cancelEdit]);

  const handleVisibleChange = (visible: boolean) => {
    setIsVisible(visible);
    if (visible) {
    }
  };

  const changeValue = (value: number | null) => {
    if (!value) {
      setError(errorMessage);
      setNewValue(0);
      return;
    }
    setNewValue(value);
    setError("");
  };

  const submitValue = () => {
    if (error) return;
    confirmEdit(newValue);
    setIsVisible(false);
    isRequire && !newValue && setNewValue(value);
  };

  return (
    <>
      <Popover
        content={
          <EditDefectWrapper>
            <NumberInput
              value={newValue}
              isFloat={false}
              onChange={(e) => changeValue(e)}
              disabled={isDisable}
              minLength={1}
              placeholder="0"
              maxLength={6}
              isChangeAfterBlur={false}
              format={(value: string) => formatCurrency(value)}
              replace={(a: string) => replaceFormatString(a)}
              style={{ width: "100%", textAlign: "left" }}
              onPressEnter={submitValue}
              className={`number-defect-${index}`}
            />
            {error && <div className="error-defect">{error}</div>}
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
                onClick={submitValue}
                disabled={isDisable}
              >
                Lưu
              </Button>
              <Button onClick={cancelEdit}>Huỷ</Button>
            </div>
          </EditDefectWrapper>
        }
        title={title}
        trigger="click"
        visible={isVisible}
        onVisibleChange={handleVisibleChange}
      >
        {isHaveEditPermission && (
          <EditOutlined style={{ marginRight: 5, color: props.color }} title={title} />
        )}
      </Popover>
      <span>
        {label && <strong>{label}</strong>}
        <span>{value}</span>
      </span>
    </>
  );
};

export default EditDefect;
