import Image from 'next/image'
import Link from './Link'

const ArtCard = ({ title, description, imagePath, alt }) => {
  // Use the imagePath for both the image source and the link
  const href = imagePath

  return (
    <div className="w-full overflow-hidden rounded-lg border-2 border-gray-200 border-opacity-60 transition-all hover:shadow-lg dark:border-gray-700">
      <Link href={href} aria-label={`Link to ${title}`}>
        <div className="relative w-full">
          {/* Use a regular img tag for natural dimensions */}
          <img src={imagePath} alt={alt || title} className="h-auto w-full" />
        </div>
        <div className="p-6">
          <h2 className="mb-2 text-2xl font-bold leading-8 tracking-tight">{title}</h2>
          {description && <p className="text-gray-700 dark:text-gray-300">{description}</p>}
        </div>
      </Link>
    </div>
  )
}

export default ArtCard
