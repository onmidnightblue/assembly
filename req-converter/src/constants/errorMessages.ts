export const ERROR_MESSAGES = {
  MEMBER: "해당하는 의원을 찾을 수 없습니다.",
  MANAGER: "할당된 담당자가 없습니다.",
  DUEDATE: "답변기한을 찾을 수 없습니다.",
  REQUESTED_DATE: "요구일시를 찾을 수 없습니다.",
  COMMITTEE: "소속된 위원회를 찾을 수 없습니다.",
  CONTENT: "메세지로 변환하는 데에 문제가 생겼습니다.",
  EMPTY: "내용을 채워주세요.",
} as const;

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export type ErrorCode = keyof typeof ERROR_MESSAGES;
