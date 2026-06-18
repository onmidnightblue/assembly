import axios from "axios";
import { gov_url } from "../constants/urls";
import { COMMITTEES } from "../constants/committees";

export const getCommitteeName = async (memberName: string): Promise<string> => {
  const { VITE_GOVERNMENT_API_KEY: gov_key } = import.meta.env || {};
  const { data } = await axios.get(gov_url, {
    params: {
      KEY: gov_key,
      Type: "json",
      pIndex: 1,
      pSize: 10,
      NAAS_NM: memberName,
    },
  });
  const response = data?.ALLNAMEMBER?.[1]?.row[0]?.CMIT_NM || "";
  const removeTrim = response.replaceAll(/\s/g, "");
  const sliceText = removeTrim.split(",");
  const result = sliceText
    .map((txt: string) => COMMITTEES[txt] || txt)
    .join(", ");
  return result;
};
