# ToDo一覧の絞り込み

ToDoページで表示されるToDoを絞り込みできるように実装します。

## stateの設計

ToDoの表示対象を絞り込むために、どのようなstateが必要になるかを考えていきます。

ボタンを押すとどれか1つが選択された状態にするため、どのボタンが選択されているかのstateは必要そうです。

他に、絞り込んだ後のToDoの一覧は、stateとして保持する必要があるかを考えます。これは、`TodoList`で使用している全てのToDoを保持するstateと、どのボタンが選択されているかのstateで算出可能なため、stateにはなりません。（参考：[React の流儀 ステップ 3 – React](https://ja.react.dev/learn/thinking-in-react#step-3-find-the-minimal-but-complete-representation-of-ui-state)）

全てのToDoを保持するstateが`TodoBoard`にあること、`TodoBoard`が`TodoList`と`TodoFilter`の共通の親であることから、どのボタンが選択されているのかのstateも`TodoBoard`に定義します。こうすることで、`TodoBoard`が全体の状態を一元管理することができ、メンテナンスが容易になります。

## コンポーネントの実装

コンポーネントの実装では、TypeScriptの型を利用した実装にしていきます。

### `TodoFilter`の実装

表示対象を選択するボタンを表示する`TodoFilter`コンポーネントを実装します。stateの設計であったとおり、現在どのボタンが押されているかを`TodoBoard`にstateとして保持させます。そのため、ここではプロパティでstateと更新関数を受け取るようにします。

また、`TodoBoard`で管理した場合、`TodoBoard`でもどういったボタンがあるのかを知っている必要があります。ただし、どういうボタンがあるのかは`TodoFilter`が決めるため、`TodoFilter`で選択可能な種類を`TodoBoard`に知らせる型を宣言します。

`src/components/board/filter/TodoFilter.tsx`
```jsx
import React from 'react';
import styles from './TodoFilter.module.css';

export type FilterType = 'ALL' | 'INCOMPLETE' | 'COMPLETED';

type Props = {
  filterType: FilterType;
  setFilterType: (filter: FilterType) => void;
};

export const TodoFilter: React.FC<Props> = ({filterType, setFilterType}) => {
  return (
    <div className={styles.content}>
      <button
        className={filterType === 'ALL' ? `${styles.buttonSelected}` : `${styles.buttonUnselected}`}
        disabled={filterType === 'ALL'}
        onClick={() => setFilterType('ALL')}
      >
        全て
      </button>
      <button
        className={filterType === 'INCOMPLETE' ? `${styles.buttonSelected}` : `${styles.buttonUnselected}`}
        disabled={filterType === 'INCOMPLETE'}
        onClick={() => setFilterType('INCOMPLETE')}
      >
        未完了のみ
      </button>
      <button
        className={filterType === 'COMPLETED' ? `${styles.buttonSelected}` : `${styles.buttonUnselected}`}
        disabled={filterType === 'COMPLETED'}
        onClick={() => setFilterType('COMPLETED')}
      >
        完了のみ
      </button>
    </div>
  );
};
```

このコンポーネントで扱うボタンの種類を知らせるため、次のように`FilterType`という型を宣言し、`export`しています。

```js
export type FilterType = 'ALL' | 'INCOMPLETE' | 'COMPLETED';
```

これはUnion Types（共用体型）と呼ばれるTypeScriptの型で、型を`|`で区切ると、その型のどれか（or条件）が代入可能になります。（参考：[TypeScript - Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)）

ここでは、このUnion Typesと固定の文字列を組み合わせることで、FilterType型にはこの文字列のどれかのみ代入することを可能にしています。
`TodoBoard`ではこの型によって、`TodoFilter`が受け入れられる値を確実に使用できます。もしこれらの文字列以外を代入しようとするとコンパイルエラーになるため、  
`TodoBoard`側のミスを防ぎ、さらに`FilterType`で種類が変わった際に問題を検知できるようになります。

### `TodoBoard`の実装

続いて、`TodoBoard`を実装します。ここでは、先ほど実装した`FilterType`型のstateを配置し、現在どれが選択されているかを保持するようにします。  
現在保持されている`FilterType`のstateにより`TodoList`にToDoデータを渡す前にフィルタ処理を行い、絞り込んだ後のToDoデータを`TodoList`のプロパティに渡すようにします。

`src/components/board/TodoBoard.tsx`
```js
...
import {FilterType, TodoFilter} from './filter/TodoFilter';
...

type ShowFilter = {
  [K in FilterType]: (todo: Todo) => boolean;
};

const showFilter: ShowFilter = {
  ALL: () => true,
  INCOMPLETE: todo => !todo.completed,
  COMPLETED: todo => todo.completed,
};

export const TodoBoard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('ALL');
...
  const showTodos = todos.filter(showFilter[filterType]);

  return (
    <div className={styles.content}>
      <TodoForm addTodo={addTodo} />
      <TodoFilter filterType={filterType} setFilterType={setFilterType} />
      <TodoList todos={showTodos} toggleTodoCompletion={toggleTodoCompletion} />
    </div>
  );
};
```

ここでは、`TodoFilter`が定義している`FilterType`型に対応したフィルタ処理を必ず宣言するように、次のような型を定義しています。

```js
type ShowFilter = {
  [K in FilterType]: (todo: Todo) => boolean;
};
```

これは、Mapped typesと呼ばれるTypeScriptの型で、オブジェクトのプロパティ名や値の型を制限することができます。`[K in FilterType]`部分はオブジェクトのプロパティ名の型を表しています。`K`は型引数であり、ここでは`FilterType`に含まれる文字列のどれかがプロパティ名として使用できるようにしています。`: (todo: Todo) => boolean`部分は、プロパティ値の型を表しています。

この型を使い、ボタンの種類に対応するフィルタ関数を定義したオブジェクトを生成しています。

```js
const showFilter: ShowFilter = {
  ALL: () => true,
  INCOMPLETE: todo => !todo.completed,
  COMPLETED: todo => todo.completed,
};
```

先ほどの型により、ここでのプロパティ名は`FilterType`に代入可能な文字列のどれかである必要があり、それ以外のプロパティ名であればコンパイルエラーになります。そのため、確実にボタンの種類に対応しているフィルタ関数を宣言されるようにしています。

ここで定義した`FilterType`に対応した関数を使用するため、次のように宣言しています。現在のstateに応じたフィルタ関数が取得され、`filter`に適用されるようにしています。

```js
const showTodos = todos.filter(showFilter[filterType]);
```

## モックを使用した動作確認

ToDoページを表示して、ボタンをクリックしてToDo一覧を絞り込んで表示できることを確認します。

確認できたら、フロントエンドのToDo一覧の絞り込みの実装は完了です。
