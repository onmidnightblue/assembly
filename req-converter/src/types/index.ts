export interface EnteredState {
  enteredSummary: string;
  enteredContent: string;
}

export interface ChangeHandlerProps {
  key: keyof EnteredState;
  value: string;
}

export interface ParsedMemberData {
  memberName?: string;
  dueDate?: string;
  requestedDate?: string;
}

export interface FormatOptions {
  manager: string;
  member: string;
  committee: string;
  content: string;
  dueDate: string;
}

export interface SummaryResult {
  memberName: string;
  committee: string;
  managerName: string;
  dueDate: string;
  requestedDate: string;
}
