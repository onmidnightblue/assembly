import { useState } from "react";
import TextArea from "./TextArea";

interface Props {
  result: string;
  setResult: (value: string) => void;
}

const Result = ({ result, setResult }: Props) => {
  const [copyState, setCopyState] = useState<string>("");

  const clipboardHandler = async () => {
    if (!result.trim()) return;
    try {
      setCopyState("···");
      await navigator.clipboard.writeText(result);
      setCopyState("✓");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCopyState("");
    } catch {
      setCopyState("error");
    }
  };

  if (!result) return null;
  return (
    <div className="flex flex-col gap-2 w-full relative">
      <TextArea
        id={"result"}
        label={"결과"}
        value={result}
        changeHandler={setResult}
        isAutoHeight={true}
      />
      <div className="flex justify-end absolute top-10 right-4">
        <div
          className="cursor-pointer text-xs rounded-md hover:border-gray-400 hover:text-blue-400"
          onClick={clipboardHandler}
        >
          {copyState || "Ctrl + C"}
        </div>
      </div>
    </div>
  );
};

export default Result;
