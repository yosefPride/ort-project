import { FIELD } from './Input';

const Textarea = ({ className = '', ...props }) => <textarea className={`${FIELD} ${className}`} {...props} />;

export default Textarea;
