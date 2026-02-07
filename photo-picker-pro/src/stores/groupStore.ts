import { defineStore } from 'pinia';
import type { Group } from '../types';

interface GroupState {
  groups: Group[];
  activeGroupId: string;
}

const defaultGroups: Group[] = [
  {
    id: 'default',
    name: '默认分组',
    type: 'default',
    icon: 'photos',
    color: '#B76E79',
    order: 0,
  },
  {
    id: 'keep',
    name: '保留分组',
    type: 'keep',
    icon: 'check',
    color: '#4CAF50',
    order: 1,
  },
  {
    id: 'reject',
    name: '不选分组',
    type: 'reject',
    icon: 'trash',
    color: '#EF5350',
    order: 2,
  },
];

const initialState: GroupState = {
  groups: defaultGroups,
  activeGroupId: 'default',
};

export const useGroupStore = defineStore('group', {
  state: (): GroupState => ({
    groups: [...initialState.groups],
    activeGroupId: initialState.activeGroupId,
  }),
  getters: {
    getGroupById: (state) => {
      return (id: string) => state.groups.find((g) => g.id === id);
    },
    getGroupCount: () => {
      return (_id: string) => 0;
    },
  },
  actions: {
    setActiveGroup(id: string) {
      this.activeGroupId = id;
    },
    reset() {
      this.$reset();
    },
  },
});

