# ToDo一覧の絞り込み

ToDoページで表示されるToDoを絞り込みできるように実装します。

## stateの設計

ToDoの表示対象を絞り込むために、どのようなstateが必要になるかを考えていきます。

ボタンを押すとどれか1つが選択された状態にするため、どのボタンが選択されているかのstateは必要そうです。

他に、絞り込んだ後のToDoの一覧は、stateとして保持する必要があるかを考えます。これは、全てのToDoを保持するstateと、どのボタンが選択されているかのstateで算出可能なため、stateにはなりません。（参考：[React - Reactの流儀 Step 3](https://ja.reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state)）

`TodoBoard`のstateを使用して算出するためには、どのボタンが選択されているかのstateも、`TodoFilter`ではなく`TodoBoard`まで引き上げた方が簡単そうです。

## コンポーネントの実装

コンポーネントの実装では、TypeScriptの型を利用した実装にしていきます。

### `TodoFilter`の実装

表示対象を選択するボタンを表示する`TodoFilter`コンポーネントを実装します。stateの設計であったとおり、現在どのボタンが押されているかはを`TodoBoard`にstateとして保持させます。そのため、ここではプロパティでstateと更新関数を受け取るようにします。

また、`TodoBoard`で管理した場合、`TodoBoard`でもどういったボタンがあるかを知っている必要があります。ただし、どういうボタンがあるかは`TodoFilter`が決めるため、`TodoFilter`で選択可能な種類を`TodoBoard`に知らせるため、型として宣言することにします。

```jsx
import React from 'react';
import './TodoFilter.css';

export type FilterType = 'ALL' | 'INCOMPLETE' | 'COMPLETED';

type Props = {
  filterType: FilterType
  setFilterType: (filter: FilterType) => void
}

export const TodoFilter: React.FC<Props> = ({filterType, setFilterType}) => {
  return (
    <div className="TodoFilter_content">
      <button className={filterType === 'ALL' ? 'TodoFilter_buttonSelected' : 'TodoFilter_buttonUnselected'}
              disabled={filterType === 'ALL'}
              onClick={() => setFilterType('ALL')}>
        全て
      </button>
      <button className={filterType === 'INCOMPLETE' ? 'TodoFilter_buttonSelected' : 'TodoFilter_buttonUnselected'}
              disabled={filterType === 'INCOMPLETE'}
              onClick={() => setFilterType('INCOMPLETE')}>
        未完了のみ
      </button>
      <button className={filterType === 'COMPLETED' ? 'TodoFilter_buttonSelected' : 'TodoFilter_buttonUnselected'}
              disabled={filterType === 'COMPLETED'}
              onClick={() => setFilterType('COMPLETED')}>
        完了のみ
      </button>
    </div>
  );
};
```

このコンポーネントで扱う種類を知らせるため、次のように`FilterType`という型を宣言し、`export`しています。

```js
export type FilterType = 'ALL' | 'INCOMPLETE' | 'COMPLETED';
```

これはUnion Types（共用体型）と呼ばれるTypeScriptの型で、型を`|`で区切ると、その型のどれか（or条件）が代入可能になります。（参考：[TypeScript - Union Types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-types)）

ここでは、このUnion Typesと固定の文字列を組み合わせることで、FilterType型にはこの文字列のどれかのみ代入することが可能にしています。
`TodoBoard`ではこの型を使用することで、間違いなく`TodoFilter`が受け入れられる値を使用することができます。もしこれらの文字列以外を代入しようとするとコンパイルエラーになるため、`TodoBoard`側のミスを防いだり、`FilterType`で種類が変わって問題が発生した場合等にコンパイルエラーで検知できるようになります。

### `TodoBoard`の実装

続いて、`TodoBoard`を実装します。ここでは、先ほど実装した`FilterType`型のstateを配置し、現在どれが選択されているかを保持するようにします。
現在保持されている`FilterType`のstateにより、`TodoList`にToDoデータを渡す前にフィルタ処理を行い、絞り込んだ後のToDoデータを`TodoList`のプロパティに渡すようにします。

```js
import { FilterType, TodoFilter } from './TodoFilter';

...

type ShowFilter = {
  [K in FilterType]: (todo: Todo) => boolean
}

const showFilter: ShowFilter = {
  ALL: (todo) => true,
  INCOMPLETE: (todo) => !todo.completed,
  COMPLETED: (todo) => todo.completed,
};

...

export const TodoBoard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('ALL');
...
  const showTodos = todos.filter(showFilter[filterType]);

  return (
    <div className="TodoBoard_content">
      <TodoForm addTodo={addTodo}/>
      <TodoFilter filterType={filterType} setFilterType={setFilterType} />
      <TodoList todos={showTodos} toggleTodoCompletion={toggleTodoCompletion}/>
    </div>
  );
};
```

ここでは、`TodoFilter`が定義している`FilterType`型に対応したフィルタ処理を必ず宣言するように、次のような型を定義しています。

```js
type ShowFilter = {
  [K in FilterType]: (todo: Todo) => boolean
}
```

これは、Mapped typesと呼ばれるTypeScriptの型で、オブジェクトのプロパティ名や値の型を制限することができます。`[K in FilterType]`部分はオブジェクトのプロパティ名の型を表しています。`K`は型引数であり、ここでは`FilterType`に含まれる文字列のどれかがプロパティ名として使用できるようにしています。`: (todo: Todo) => boolean`部分は、プロパティ値の型を表しています。

この型を使い、ボタンの種類に対応するフィルタ関数を定義したオブジェクトを生成しています。

```js
const showFilter: ShowFilter = {
  ALL: (todo) => true,
  INCOMPLETE: (todo) => !todo.completed,
  COMPLETED: (todo) => todo.completed,
};
```

先ほどの型により、ここでのプロパティ名には`FilterType`に代入可能な文字列のどれかである必要があり、それ以外のプロパティ名であればコンパイルエラーになります。そのため、確実にボタンの種類に対応しているフィルタ関数を宣言されるようにしています。

ここで定義した`FilterType`に対応した関数を使用するため、次のように宣言しています。現在のstateに応じたフィルタ関数が取得され、`filter`に適用されるようにしています。

```js
const showTodos = todos.filter(showFilter[filterType]);
```

## 動作確認

フロントエンドのみで実装しているため、バックエンドと接続する必要はありません。フロントエンドアプリを起動し、ToDoページが表示されたら、ボタンをクリックしてToDo一覧を絞り込んで表示することができることを確認します。

確認できたら、フロントエンドの開発は完了です。
