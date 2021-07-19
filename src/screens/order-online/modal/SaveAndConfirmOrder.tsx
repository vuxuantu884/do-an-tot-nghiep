import { Modal} from 'antd';

type SaveAndConfirmOrderModalProps = {
  visible: boolean;
  order_id?: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  text: string;
  title: string
}

const SaveAndConfirmOrder: React.FC<SaveAndConfirmOrderModalProps> = (props: SaveAndConfirmOrderModalProps) => {
  const {visible, onCancel, onOk, text, title} = props
  return (
    <Modal
            onCancel={onCancel}
            onOk={onOk}
            visible={visible}
            centered
            okText="Có"
            cancelText="Không"
            title={title}
        >
            <span>
            {text}
            </span>
        </Modal>
  )
}

export default SaveAndConfirmOrder;