const {
  VITE_ASSIGNEE_1: ASSIGNEE_1 = '담당자1',
  VITE_ASSIGNEE_2: ASSIGNEE_2 = '담당자2',
  VITE_ASSIGNEE_3: ASSIGNEE_3 = '담당자3',
} = import.meta.env || {};

export const ASSIGNED_DAY: Record<number, string> = {
  0: ASSIGNEE_1, // sun
  1: ASSIGNEE_1, // mon
  2: ASSIGNEE_2, // tue
  3: ASSIGNEE_2, // wed
  4: ASSIGNEE_3, // thu
  5: ASSIGNEE_3, // fri
  6: ASSIGNEE_1, // sat
};

export const IN_CHARGE_MAP: Record<string, string> = {
  한병도: ASSIGNEE_1,
  천준호: ASSIGNEE_1,
  김한규: ASSIGNEE_1,
  이기헌: ASSIGNEE_1,
  이용우: ASSIGNEE_1,
  강선영: ASSIGNEE_1,
  박충권: ASSIGNEE_1,
  서지영: ASSIGNEE_1,
  윤종오: ASSIGNEE_1,
  김남근: ASSIGNEE_2,
  문금주: ASSIGNEE_2,
  박민규: ASSIGNEE_2,
  백승아: ASSIGNEE_2,
  안태준: ASSIGNEE_2,
  전진숙: ASSIGNEE_2,
  송언석: ASSIGNEE_2,
  유상범: ASSIGNEE_2,
  김은혜: ASSIGNEE_2,
  박수민: ASSIGNEE_2,
  전용기: ASSIGNEE_3,
  김기표: ASSIGNEE_3,
  김성회: ASSIGNEE_3,
  서미화: ASSIGNEE_3,
  이훈기: ASSIGNEE_3,
  곽규택: ASSIGNEE_3,
  조지연: ASSIGNEE_3,
  최수진: ASSIGNEE_3,
  신장식: ASSIGNEE_3,
};
