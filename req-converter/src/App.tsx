import { useState } from "react";
import TextArea from "./components/TextArea";
import Button from "./components/Button";
import Result from "./components/Result";
import ErrorMessage from "./components/ErrorMessage";
import type { ChangeHandlerProps, EnteredState } from "./types/index.ts";
import { useConverter } from "./hooks/useConverter.ts";
import Guide from "./components/Guide.tsx";
import ResultSummary from "./components/ResultSummary.tsx";

function App() {
  const [entered, setEntered] = useState<EnteredState>({
    enteredSummary: "",
    enteredContent: "",
  });
  const { result, summary, error, converter } = useConverter(entered);

  const enteredResetHandler = () => {
    result.set("");
    summary.set(null);
    error.set("");
  };

  const changeHandler = ({ key, value }: ChangeHandlerProps) => {
    setEntered((prev) => ({ ...prev, [key]: value }));
    enteredResetHandler();
  };

  const resetHandler = () => {
    setEntered({ enteredSummary: "", enteredContent: "" });
    enteredResetHandler();
  };

  return (
    <>
      <header className="text-center pt-12">
        <h1 className="font-bold text-4xl">요구서 메세지 변환기</h1>
        <Guide />
      </header>
      <main className="px-12">
        <form className="flex flex-col gap-4 py-8">
          <TextArea
            id={"enteredSummary"}
            label={"요구서 개요"}
            value={entered.enteredSummary}
            changeHandler={(value) =>
              changeHandler({ key: "enteredSummary", value: value })
            }
          />
          <TextArea
            id={"enteredContent"}
            label={"요구서 본문"}
            value={entered.enteredContent}
            changeHandler={(value) =>
              changeHandler({ key: "enteredContent", value: value })
            }
          />
          <div className="w-full flex gap-4">
            <Button
              type={"reset"}
              label={"초기화"}
              clickHandler={resetHandler}
            />
            <Button type={"submit"} label={"변환"} clickHandler={converter} />
          </div>
          <ErrorMessage error={error.value} />
        </form>
        <div className="py-8 flex flex-col gap-4">
          <ResultSummary summary={summary.value} />
          <Result result={result.value} setResult={result.set} />
        </div>
      </main>
    </>
  );
}

export default App;
