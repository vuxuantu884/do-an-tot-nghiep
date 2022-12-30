import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import React from "react";
import color from "assets/css/export-variable.module.scss";

type Props = {
  passwordChecklist: PasswordChecklist[];
};
interface PasswordChecklist {
  description: string;
  passed: boolean;
}
function PasswordChecklist({ passwordChecklist }: Props) {
  return (
    <div className="password-check-list">
      {passwordChecklist.map((item, index) => {
        return (
          <div key={index}>
            {item.passed ? (
              <CheckCircleOutlined style={{ color: color.green }} />
            ) : (
              <CloseCircleOutlined style={{ color: color.red }} />
            )}
            &nbsp;
            <span> {item.description}</span>
          </div>
        );
      })}
    </div>
  );
}

export default PasswordChecklist;
