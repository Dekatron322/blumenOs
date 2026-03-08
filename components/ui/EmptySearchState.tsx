import EmptyState from "public/empty-state"

interface EmptySearchStateProps {
  title?: string
  description?: string
  className?: string
}

const EmptySearchState = ({
  title = "No results found",
  description = "Try adjusting your search criteria",
  className = "",
}: EmptySearchStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-10 md:py-14 ${className}`}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center">
          <EmptyState />
        </div>
        <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">{title}</h3>
        <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">{description}</p>
      </div>
    </div>
  )
}

export default EmptySearchState
