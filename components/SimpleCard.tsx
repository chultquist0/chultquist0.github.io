import Link from './Link'

const SimpleCard = ({ title, href }) => (
  <div className="md max-w-[544px] p-4 md:w-3/4">
    <div className="overflow-hidden rounded-md border-2 border-gray-200 border-opacity-60 dark:border-gray-700">
      <div className="p-6">
        <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
      </div>
    </div>
  </div>
)

export default SimpleCard
