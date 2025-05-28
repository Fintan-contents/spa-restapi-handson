import React, {useCallback} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {useArgs} from '@storybook/preview-api';
import {action} from '@storybook/addon-actions';
import {TodoFilter, FilterType} from './TodoFilter';

const meta = {
  title: 'TodoFilter',
  component: TodoFilter,
  args: {
    filterType: 'ALL',
    setFilterType: () => {},
  },
} satisfies Meta<typeof TodoFilter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: function Render(args) {
    const [, setFilterTypeArgs] = useArgs();

    const setFilterType = useCallback(
      (newFilterType: FilterType) => {
        action('setFilterType')(newFilterType);
        setFilterTypeArgs({filterType: newFilterType});
      },
      [setFilterTypeArgs],
    );

    return <TodoFilter filterType={args.filterType} setFilterType={setFilterType} />;
  },
};

export const ALL: Story = {
  args: {
    filterType: 'ALL',
  },
  argTypes: {
    filterType: {
      control: false,
    },
  },
};

export const INCOMPLETE: Story = {
  args: {
    filterType: 'INCOMPLETE',
  },
  argTypes: {
    filterType: {
      control: false,
    },
  },
};

export const COMPLETED: Story = {
  args: {
    filterType: 'COMPLETED',
  },
  argTypes: {
    filterType: {
      control: false,
    },
  },
};
