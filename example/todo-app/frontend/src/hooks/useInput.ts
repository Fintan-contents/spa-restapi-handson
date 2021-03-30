import { useState } from 'react';

/**
 * input要素のステートフックとステート更新をラッピングした独自フック。
 *
 * @param initialState 初期値
 * @return [input要素のステート, input要素の属性, ステート更新の関数]
 */
export const useInput = (initialState: string = ''): [string, React.InputHTMLAttributes<HTMLInputElement>, React.Dispatch<React.SetStateAction<string>>] => {
  const [value, setValue] = useState<string>(initialState);

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  return [
    value,
    {
      value,
      onChange
    },
    setValue
  ];
};