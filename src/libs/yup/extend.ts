import * as yup from "yup";
import { AnyObject, Maybe } from "yup/lib/types";

declare module "yup" {
  interface NumberSchema<
    TType extends Maybe<number> = number | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType,
  > extends yup.BaseSchema<TType, TContext, TOut> {
    maxLength(max: number, message?: string): NumberSchema<TType, TContext>;
  }

  interface NumberSchema<
    TType extends Maybe<number> = number | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType,
  > extends yup.BaseSchema<TType, TContext, TOut> {
    maxLengthInteger(max: number, message?: string): NumberSchema<TType, TContext>;
  }

  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType,
  > extends yup.BaseSchema<TType, TContext, TOut> {
    requiredRichText(message?: string): StringSchema<TType, TContext>;
  }
}
