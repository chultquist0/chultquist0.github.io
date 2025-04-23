interface Crossword {
  type: number
  date: string
  href?: string
}

const crosswordsData: Crossword[] = [
  {
    date: 'Thursday, Feb. 12, 2025',
    type: 3,
    href: '/cube/cube.html',
  },
  {
    date: 'Thursday, Nov. 26, 2020',
    type: 2,
    href: '/crossword2d/Crossword112620.pdf',
  },
  {
    date: 'Wednesday, Apr. 23, 2025',
    type: 2,
    href: '/crossword2d/LeGuin.pdf',
  },
]

export default crosswordsData
