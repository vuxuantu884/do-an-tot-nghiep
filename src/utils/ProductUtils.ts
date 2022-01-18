import { FormInstance } from "antd";
import { MaterialResponse } from "model/product/material.model";
import { VariantResponse } from "model/product/product.model";

export const handleChangeMaterial = (material: MaterialResponse | false, form: FormInstance) => {
    if (material) {
      let description = form.getFieldValue("description");
      
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
     description += formatDescription;
      form.setFieldsValue({ description: description, material: material.name });
    }
  };

  export const getFirstProductAvatarByVariantResponse = (variants: Array<VariantResponse>) => {
    let isFind = false;
    let variantAvatarIndex = 0;
    const FIRST_VARIANT_IMAGE_INDEX = 0;

    const revertVariants = variants.reverse();
    //check existed product avatar, if not => set first variant image for product avatar
    revertVariants.forEach((item, i) => {
      if (item.saleable && !isFind) {
        item.variant_images.forEach((item) => {
          if (!isFind) {
            if (item.product_avatar) {
              isFind = true;
            } else {
              variantAvatarIndex = i;
            }
          }
        });
      }
    });

    if (!isFind && revertVariants[variantAvatarIndex].variant_images[FIRST_VARIANT_IMAGE_INDEX]) {
      //reset product avatar
      revertVariants.forEach((item) => {
        item.variant_images.forEach((item) => {
          item.product_avatar = false;
        });
      });

      //set product avatar
      if (revertVariants[variantAvatarIndex].saleable)
        revertVariants[variantAvatarIndex].variant_images[
          FIRST_VARIANT_IMAGE_INDEX
        ].product_avatar = true;
    }

    return revertVariants.reverse();
  };