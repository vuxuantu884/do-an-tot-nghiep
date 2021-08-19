export interface keyWordsModel {
  title: string;
  key: string;
  value: string;
}

export type listKeyWordsModel = keyWordsModel[];

export interface EditorModel {
  initialHtmlContent: string;
  onChange: (data: string) => void;
  listKeyWords?: listKeyWordsModel;
}

export interface EditorModalType {
  isModalVisible: boolean;
  handleCancel: () => void;
  insertKeyword: (text: string) => void;
  listKeyWords?: listKeyWordsModel;
}

export interface PrintEditorModel {
  initialValue?: string;
  onChange: (value: string) => void;
}

export interface PrintPreviewModel {
  htmlContent: string;
  listKeyWords?: listKeyWordsModel;
}

export type SinglePrinterContentModel = string;

export interface FormValueModel {
  tenMauIn: string;
  chiNhanhApDung: string;
  khoIn: string;
  apDung: boolean;
  formIn: SinglePrinterContentModel;
}

export interface FormPrinterModel {
  id: string | number;
  tenMauIn: string;
  chiNhanhApDung: string;
  khoIn: string;
  apDung: boolean;
  formIn?: SinglePrinterContentModel;
}
