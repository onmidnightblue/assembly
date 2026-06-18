interface Props {
  error: string;
}

const ErrorMessage = ({ error }: Props) => {
  return error && <div className="text-red-800 text-center">{error}</div>;
};

export default ErrorMessage;
