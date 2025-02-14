import crosswordsData from '@/data/crosswordData'
import SimpleCard from '@/components/SimpleCard'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Crosswords() {
  const twoD = crosswordsData.filter((d) => d.type === 2)
  const threeD = crosswordsData.filter((d) => d.type === 3)

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Crosswords
          </h1>
          <p>A collection of various 2D and 3D crosswords I have made throughout the years</p>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            <div className="w-full p-4 md:w-1/2">
              <h2 className="mb-4 text-2xl font-bold">2D Crosswords</h2>
              <div className="-m-4 flex flex-wrap">
                {twoD.map((d) => (
                  <SimpleCard key={d.date} title={d.date} href={d.href} />
                ))}
              </div>
            </div>
            <div className="w-full p-4 md:w-1/2">
              <h2 className="mb-4 text-2xl font-bold">3D Crosswords</h2>
              <div className="-m-4 flex flex-wrap">
                {threeD.map((d) => (
                  <SimpleCard key={d.date} title={d.date} href={d.href} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
