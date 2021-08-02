import { FormInstance } from "antd";

export type modalActionType = "edit" | "create";

export interface CustomModalFormModel {
  visible: boolean;
  modalAction: modalActionType;
  formItem: any;
  form: FormInstance<any>;
  moreFormArguments?: any;
}

export interface CustomModalType {
  visible?: boolean;
  onCreate: (formValue: any) => void;
  onEdit: (formValue: any) => void;
  onDelete: (formValue: any) => void;
  onCancel: (formValue: any) => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  modalAction: modalActionType;
  modalTypeText: string;
  deletedItemTitle?: string;
  componentForm: React.FC<CustomModalFormModel>;
  formItem: any;
  moreFormArguments?: any;
}
