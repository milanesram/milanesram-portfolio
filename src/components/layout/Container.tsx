type ContainerProps = {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
};

export function Container({ children, narrow = false, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-5 sm:px-8 ${narrow ? "max-w-[42rem]" : "max-w-[72rem]"} ${className}`}
    >
      {children}
    </div>
  );
}
