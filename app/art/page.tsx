import artData from '@/data/artData'
import ArtCard from '@/components/ArtCard'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Art() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Digital Art
          </h1>
          <p>A collection of my digital art, mostly inspired by my surroundings in the San Francisco Bay Area</p>
        </div>
        <div className="container py-12">
          <div className="mx-auto max-w-3xl space-y-8">
            {artData.map((d) => (
              <ArtCard 
                key={d.title} 
                title={d.title} 
                description={d.desc} 
                imagePath={d.imagePath} 
                alt={d.alt} 
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}