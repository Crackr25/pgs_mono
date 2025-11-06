export default function Card({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-sm',
  border = 'border border-secondary-200',
  ...props 
}) {
  return (
    <div 
      className={`bg-white rounded-lg ${shadow} ${border} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
