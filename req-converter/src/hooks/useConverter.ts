import { useState } from "react";
import type { EnteredState, SummaryResult } from "../types";
import { parseContentData, parseMemberData } from "../utils/regex";
import { generateFormat, getManager } from "../utils/converter";
import { getCommitteeName } from "../api/api";
import {
  ERROR_MESSAGES,
  isError,
  type ErrorCode,
} from "../constants/errorMessages";

export const useConverter = (entered: EnteredState) => {
  const [result, setResult] = useState("");
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  const converter = async (e?: React.SubmitEvent) => {
    try {
      if (e) e.preventDefault();

      const { enteredSummary, enteredContent } = entered;
      if (!enteredSummary || !enteredContent) throw new Error("EMPTY");

      // summary
      const { memberName, dueDate, requestedDate } =
        parseMemberData(enteredSummary);
      if (!memberName) throw new Error("MEMBER");
      if (!dueDate) throw new Error("DUEDATE");
      if (!requestedDate) throw new Error("REQUESTED_DATE");

      const committee = await getCommitteeName(memberName);
      // if (!committee) throw new Error("COMMITTEE");
      const managerName = getManager(requestedDate, memberName);
      if (!managerName) throw new Error("MANAGER");

      // content
      const content = parseContentData(enteredContent);
      if (!content) throw new Error("CONTENT");

      // result
      const result = generateFormat({
        manager: managerName,
        member: memberName,
        committee,
        content,
        dueDate,
      });

      setSummaryResult({
        memberName,
        committee,
        managerName,
        dueDate,
        requestedDate,
      });
      setResult(result);
      setErrorMessage("");
    } catch (error) {
      if (isError(error)) {
        const code = error.message as ErrorCode;
        setErrorMessage(ERROR_MESSAGES[code] || "something error.");
      }
    }
  };

  return {
    result: { value: result, set: setResult },
    summary: { value: summaryResult, set: setSummaryResult },
    error: { value: errorMessage, set: setErrorMessage },
    converter,
  };
};
