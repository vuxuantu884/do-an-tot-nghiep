import { RuleObject } from "antd/lib/form";
import { AnyObjectSchema } from "yup";

export const validateFormFields = async (
  rule: RuleObject,
  schema: AnyObjectSchema,
  context: any,
) => {
  const field = (rule as { field: string }).field as string;
  await schema.validateSyncAt(field, context);
};
