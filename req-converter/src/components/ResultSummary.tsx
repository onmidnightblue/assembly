import { DAYS } from "../constants/days";
import { ASSIGNED_DAY } from "../constants/members";

interface Props {
  summary: {
    memberName: string;
    committee: string;
    managerName: string;
    dueDate: string;
    requestedDate: string;
  } | null;
}

const ResultSummary = ({ summary }: Props) => {
  const { memberName, committee, managerName, dueDate, requestedDate } =
    summary || {};
  const dayNumber = requestedDate ? new Date(requestedDate)?.getDay() : "";
  const findDayKorean = dayNumber ? DAYS[dayNumber] : "";
  const manager = dayNumber ? ASSIGNED_DAY[dayNumber] : "";

  const SUMMARY_DATA = {
    날짜: `${requestedDate} 요청\n${dueDate} 답변`,
    [findDayKorean + "요일 담당자"]: `${manager} 주무관님`,
    ["요구서 담당자"]: `${managerName} 주무관님`,
    의원명: `${memberName} 의원`,
    소속: committee ? committee?.replaceAll(",", "\n") : "-",
  };

  return (
    summary && (
      <div className="w-full flex flex-col gap-2">
        <ul className="flex gap-2">
          {Object.entries(SUMMARY_DATA).map(([label, value]) => (
            <li className="flex flex-col gap-2 w-full text-center">
              <div className="text-sm">{label}</div>
              <div className="whitespace-pre-wrap bg-gray-100 p-2 rounded-md">
                {value}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default ResultSummary;
