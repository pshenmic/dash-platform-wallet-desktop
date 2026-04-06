type ListSkeletonProps = {
  rows?: number
  rowClassName?: string
  className?: string
}

export default function ListSkeleton({
  rows = 5,
  rowClassName = 'h-[3.5rem] rounded-[.875rem]',
  className = 'flex flex-col gap-[.625rem]',
}: ListSkeletonProps): React.JSX.Element {
  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`${rowClassName} animate-pulse bg-dash-primary-dark-blue/8 dark:bg-white/8`}
        />
      ))}
    </div>
  )
}
