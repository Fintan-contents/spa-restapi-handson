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
