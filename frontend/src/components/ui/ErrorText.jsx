const ErrorText = ({ error, className = '' }) => (error ? <p className={`text-sm text-red-500 ${className}`}>{error.message ?? error}</p> : null);

export default ErrorText;
