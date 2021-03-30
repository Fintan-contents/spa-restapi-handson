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