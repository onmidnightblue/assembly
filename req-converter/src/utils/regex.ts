const EXTRACTION_PATTERNS = {
  MEMBER: /국회의원\s+([가-힣]+)의원실/,
  DUE_DATE: /답변기한\s*:\s*(\d{4}-\d{2}-\d{2})/,
  REQUESTED_DATE: /요구서 수신일\s*:\s*(\d{4}-\d{2}-\d{2})/,
  CONTENT: /(1\.[\s\S]*?)(?=담당자\s*:)/,
};

const CLEANUP_PATTERNS = {
  LINEBREAK_REMOVAL: /([가-힣\w·()[\]])\s*\n+\s*([가-힣\w·()[\]])/g,
  LINEBREAK_BEFORE_INDEX: /(?<=\S)\s+(\d+(?:-\d+)?\.)/g,
  FORMAT_HYPHEN: /(?<![a-zA-Z0-9])-(?![a-zA-Z0-9])|(?<=[가-힣])-|-/g,
  PROTECT_INLINE_HYPHEN: /[a-zA-Z0-9]-[a-zA-Z0-9]/,
  FIRST_INDEX: /^(1\.)\s*\n+/,
  REMOVE_EMPTY_LINES: /\n\s*\n/g,
  REDUCE_MULTIPLE_SPACES: /[ ]{2,}/g,
};

export const parseMemberData = (enteredSummary: string) => {
  const match = (pattern: RegExp) => enteredSummary.match(pattern)?.[1] ?? "";

  return {
    memberName: match(EXTRACTION_PATTERNS.MEMBER),
    dueDate: match(EXTRACTION_PATTERNS.DUE_DATE),
    requestedDate: match(EXTRACTION_PATTERNS.REQUESTED_DATE),
  };
};

export const parseContentData = (enteredContent: string) => {
  const regexContent = enteredContent.match(EXTRACTION_PATTERNS.CONTENT);
  const content = regexContent?.[1];

  const result = content
    ?.replace(CLEANUP_PATTERNS.LINEBREAK_REMOVAL, "$1 $2")
    ?.replace(CLEANUP_PATTERNS.LINEBREAK_BEFORE_INDEX, "\n$1")
    .replace(CLEANUP_PATTERNS.FORMAT_HYPHEN, (_, offset, str) => {
      const isWordBound = CLEANUP_PATTERNS.PROTECT_INLINE_HYPHEN.test(
        str.substring(offset - 1, offset + 2)
      );
      return isWordBound ? "-" : "\n  -";
    })
    .replace(CLEANUP_PATTERNS.FIRST_INDEX, "$1 ")
    .replace(CLEANUP_PATTERNS.REMOVE_EMPTY_LINES, "\n")
    .replace(CLEANUP_PATTERNS.REDUCE_MULTIPLE_SPACES, " ")
    .trim();

  return result;
};
