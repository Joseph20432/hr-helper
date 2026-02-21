export interface Participant {
  id: string;
  name: string;
  department?: string;
}

export interface Group {
  id: string;
  name: string;
  members: Participant[];
}

export type AppTab = 'input' | 'draw' | 'grouping';
