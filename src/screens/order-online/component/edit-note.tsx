import {
  EditOutlined,
} from "@ant-design/icons";
import { Button, Input, Popover } from "antd";
import { useState } from "react";

type EditNoteProps = {
  note: any;
	title?: string;
  onOk: (newNote: string) => void;
};
const EditNote: React.FC<EditNoteProps> = (
  props: EditNoteProps
) => {
  const { note, title, onOk } = props;
  const [visible, setVisible] = useState(false);
  const [newNote, setNewNote] = useState(note); 
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible)
  };

  const onChangeNote = (e: any) => {
    console.log('e.target.value', e.target.value);
    
    setNewNote(e.target.value)
  };
  return (
    <div className="wrapper">
			<Popover
				content={
					<div>
						<Input.TextArea value={newNote} onChange={(e) => onChangeNote(e)} style={{ width: 300}}/>
						<div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								type="primary"
								style={{ marginRight: 10}}
								onClick={() => {
									onOk(newNote)
									setVisible(false);
								}}
							>Lưu</Button>
							<Button onClick={() => {
								setNewNote(note);
								setVisible(false)
							}}>Huỷ</Button>
						</div>
					</div>
				}
				title="Sửa ghi chú"
				trigger="click"
				visible={visible}
				onVisibleChange={handleVisibleChange}
				
			>
				<EditOutlined style={{ marginRight: 5}} title="Sửa ghi chú"/>
			</Popover>
			<span>
				{title && (
					<strong>{title}</strong>
				)}
				<span>{note}</span>

			</span>
    </div>
  );
};

export default EditNote;
