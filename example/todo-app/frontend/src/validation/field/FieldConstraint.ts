// 検証するクラスから制約を扱うときのインタフェース
interface Constraint<T> {
  validate(value: T): string | null;
}

// 検証の関数定義は、エラーなかったときにnullとか空文字返すのが面倒だったのでundefinedにした
type ValueConstraint<T> = (value: T | null) => string | undefined;

export default abstract class FieldConstraint<T> implements Constraint<T> {

  constraints: Set<ValueConstraint<T>> = new Set();

  define(constraint: ValueConstraint<T>): this {
    this.constraints.add(constraint);
    return this;
  }

  // 空文字で返してもいいけど、なんとなくエラー無いのを空文字で表現するのは違和感なのでnullにした。undefinedの方がいいのか。
  validate(value: T | null): string | null {
    // !!! for-ofでdownlevelIterationコンパイルオプション無いとダメみたいなエラーになったことがあった
    // !!! 再現条件がわからないので検証できない…
    for (const constraint of this.constraints) {
      const message = constraint(value);
      if (message) {
        return message;
      }
    }
    return null;
  }
}