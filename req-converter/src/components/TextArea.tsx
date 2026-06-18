import { useCallback, useLayoutEffect, useRef } from "react";

interface Props {
  id: string;
  label: string;
  value: string;
  changeHandler: (value: string) => void;
  isAutoHeight?: boolean;
}

const TextArea = ({ id, label, value, changeHandler, isAutoHeight }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const changedHeightHandler = useCallback(() => {
    const textarea = textareaRef.current;
    if (isAutoHeight && textarea) {
      const scrollTop = window.scrollY;
      textarea.style.height = "auto";
      const nextHeight = textarea.scrollHeight;
      textarea.style.height = `${nextHeight + 200}px`;
      if (scrollTop !== window.scrollY) {
        window.scrollTo(0, scrollTop);
      }
    }
  }, [isAutoHeight]);

  useLayoutEffect(() => {
    changedHeightHandler();
  }, [value, changedHeightHandler]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => changeHandler(e.target.value)}
        className={`border min-h-20 rounded-md outline-none break-all ${
          isAutoHeight ? "resize-none overflow-hidden" : ""
        }`}
      />
    </div>
  );
};

export default TextArea;
