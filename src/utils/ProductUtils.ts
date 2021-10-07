import { MaterialResponse } from "model/product/material.model";
import {FormInstance} from "antd"
export const handleChangeMaterial = (material: MaterialResponse | false, form: FormInstance) => {
    if (material) {
      const formatDescription = `<p>
      <strong style="color: rgb(34, 34, 34)">Thông tin bảo quản: </strong>
      <span style="background-color: transparent"
        >${material.preserve}</span
      >
    </p>
    <p><br /></p>
    <p>
      <strong style="color: rgb(34, 34, 34)">Ưu điểm: </strong
      ><span style="background-color: transparent">${material.advantages}</span>
    </p>
    <p><br /></p>
    <p>
      <strong style="color: rgb(34, 34, 34)">Ghi chú: </strong>${material.description}
    </p>
    `;
      form.setFieldsValue({ description: formatDescription });
    }
  };