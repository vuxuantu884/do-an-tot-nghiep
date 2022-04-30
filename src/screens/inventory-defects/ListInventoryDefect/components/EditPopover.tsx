import {
  EditOutlined,
} from "@ant-design/icons";
import { Button, Input, Popover } from "antd";
import { useState } from "react";

type EditPopoverProps = {
  content: any;
	title?: string;
	color?: string;
	isDisable?: boolean;
  onOk: (newContent: string) => void;
	label?: string;
};
const EditPopover: React.FC<EditPopoverProps> = (
  props: EditPopoverProps
) => {
  const { content, title, onOk, isDisable=false, label } = props;
  const [visible, setVisible] = useState(false);
  const [newContent, setNewContent] = useState(content); 
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible)
  };

  const onChangeContent = (e: any) => {
    setNewContent(e.target.value)
  };
  return (
    <div className="wrapper">
			<Popover
				content={
					<div>
						<Input.TextArea value={newContent} onChange={(e) => onChangeContent(e)} style={{ width: 300}} disabled={isDisable}/>
						<div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								type="primary"
								style={{ marginRight: 10}}
								onClick={() => {
									onOk(newContent)
									setVisible(false);
								}}
								disabled={isDisable}
							>Lưu</Button>
							<Button onClick={() => {
								setNewContent(content);
								setVisible(false)
							}}>Huỷ</Button>
						</div>
					</div>
				}
				title={title ?? "Sửa ghi chú"}
				trigger="click"
				visible={visible}
				onVisibleChange={handleVisibleChange}
				
			>
				<EditOutlined style={{ marginRight: 5, color: props.color}} title={title ?? "Sửa ghi chú"}/>
			</Popover>
			<span>
				{label && (
					<strong>{label}</strong>
				)}
				<span className="noteText">{content}</span>

			</span>
    </div>
  );
};

export default EditPopover;
