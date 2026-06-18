import { DAYS } from "../constants/days";
import { yyyymmddFormater } from "../utils/converter";

const Guide = () => {
  const today = new Date();
  const dayNumber = today.getDay();
  const yyyymmdd = yyyymmddFormater(today);
  const findDayKorean = DAYS[dayNumber];

  return (
    <p className="p-2">
      {yyyymmdd} {findDayKorean}요일
    </p>
  );
};

export default Guide;
