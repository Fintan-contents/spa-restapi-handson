import React, { useState } from 'react';
import StringFieldConstraint from './field/StringFieldConstraint';
import StringArrayFieldConstraint from './field/StringArrayFieldConstraint';
import NumberFieldConstraint from './field/NumberFieldConstraint';

// stringは検証できるが他のを考慮していないので型制約を
// バリエーション用にnumberもOKにするが、Formで使うときのevent.current.targetはstringなので、stringしか使い道なさそう
type AvailableFiledType = { [key: string]: string | number | string[] };

// IDEで補完が効くように、Genericsで検証対象フィールドを指定させてそれに基づいた型制約を
type FieldConstraintSchema<T> = Record<keyof T, Constraint<any>>;
type ValidationError<T> =  Record<keyof T, string>;
type SetValidationError<T> = (name: keyof T, message: string) => void;
type ConstraintValidatorList<T> = { [K in keyof T]: ConstraintValidator<T[K]> }

// 検証するクラスから制約を扱うときのインタフェース
interface Constraint<T> {
  validate(value: T): string | null;
}

// ReactHookForm、FORMIK、HTML5 ConstraintValidation、を参考にしている
// https://react-hook-form.com/jp/api#useForm
// https://jaredpalmer.com/formik/docs/guides/validation
// https://developer.mozilla.org/ja/docs/Web/Guide/HTML/HTML5/Constraint_validatio
//
// 検証実行用のカスタムフック。検証器と検証結果をもたせる。
// useFormみたいにして検証値を渡すとかも内部で処理してくれるようなライブラリのイメージで最初は作ってみたが、
// 考慮することが多くなって使い方が難しくなりそうで、カスタマイズつらそうなので、
// validationだけに限定して、値は外で自分で渡して起動してもらうようにした。
// 実行タイミングは自分で制御したくなるときがあると思うので、一括実行と個別実行ができるイメージにした。
// TypeScriptのメリットを活かすため、IDEの補完や型安全に書けるようにはしてみた。（ここがむずかしい）
// 項目単位じゃなくて複数項目あつかうときもあるだろうけど、それはまだ実装していない。
// フォーム制約はフィールド制約と一緒に定義できるようにGenericsやUnionType、MappedTypeとか使って途中まで実装したが、
// IDE補完が色々とできるようにように実装するのが難しくて悩ましかったので、一旦やめた。
// フォーム制約の補完はある程度で諦めて、第二引数に定義できるような実装にしてみればよさそうに考え中。
const useValidation = <T extends AvailableFiledType>(schema: FieldConstraintSchema<T>) => {
  const [error, setError] = useState<ValidationError<T>>({} as ValidationError<T>);

  // これはフォーム制約でも使いやすいように整えてreturnできるようにすればよさそう
  const setValidationError: SetValidationError<T> = (name, message): void => {
    const newError = {} as ValidationError<T>;
    newError[name] = message;
    setError((error) => {
      return {...error, ...newError};
    });
  };
  const resetError = () => {
    setError((error) => {
      return {} as ValidationError<T>;
    });
  };
  const validator = new ConstraintValidators<T>(schema, setValidationError);

  // ESLintのindex設定変えた方がよさそう
  const handleSubmit = (value: T,
    callback: (event: React.FormEvent<HTMLFormElement>) => void,
    onError: (event: React.FormEvent<HTMLFormElement>) => void = () => {}) => {

    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      resetError();
      const isError = validator.validateAll(value);
      if (isError) {
        onError(event);
        return;
      }
      callback(event);
    };
  };

  return {
    error,
    resetError,
    validator,
    handleSubmit
  };
};

// ぜんぶの制約をまとめて一括検証できるクラス
class ConstraintValidators<T extends AvailableFiledType> {

  constraint: ConstraintValidatorList<T>;

  constructor(schema: FieldConstraintSchema<T>, setValidationError: SetValidationError<T>) {
    const init = {} as ConstraintValidatorList<T>;
    for (const key of Object.keys(schema)) {
      const schemaItem = schema[key];
      init[key as keyof T] = new ConstraintValidator<any>(key, schemaItem, setValidationError);
    }
    this.constraint = init;
  }

  validateAll(value: T): boolean {
    let isError = false;
    for (const key of Object.keys(this.constraint)) {
      const error = this.constraint[key as keyof T].validate(value[key as keyof T]);
      if (error) {
        isError = true;
      }
    }
    return isError;
  }
}

// 制約を検証するクラス（いまはフィールド制約だけ）
class ConstraintValidator<T> {

  name: keyof T;

  constraint: Constraint<T>;

  setValidationError: SetValidationError<T>;

  constructor(name: keyof T, constraint: Constraint<T>, setValidationError: SetValidationError<T>) {
    this.name = name;
    this.constraint = constraint;
    this.setValidationError = setValidationError;
  }

  validate<V>(value: V): boolean {
    let message: string | null = null;
    if (this.constraint instanceof NumberFieldConstraint) {
      const numValue = this.constraint.isNumber(value) ? Number(value) : null;
      message = this.constraint.validate(numValue);

    } else if (this.constraint instanceof StringFieldConstraint) {
      // instanceofで判定しないとTypeGuardでコンパイルエラーになる
      message = this.constraint.validate(String(value));
    } else if (this.constraint instanceof StringArrayFieldConstraint) {
      const arrayValue = Array.isArray(value) ? value : null;
      message = this.constraint.validate(arrayValue);
    }

    if (message !== null) {
      this.setValidationError(this.name, message);
      return true;
    }
    return false;
  }
}

export { useValidation };
