interface Props {
  type?: "submit" | "reset";
  label: string;
  clickHandler: () => void;
}

const BUTTON_STYLES: Record<string, string> = {
  reset: "bg-blue-100 text-black",
  submit: "bg-blue-400 text-white",
};

const Button = ({ type, label, clickHandler }: Props) => {
  return (
    <button
      type={type}
      className={`cursor-pointer  transition-colors rounded-md w-full px-4 py-2 ${
        BUTTON_STYLES[type || "submit"]
      }
      `}
      onClick={clickHandler}
    >
      {label}
    </button>
  );
};

export default Button;
