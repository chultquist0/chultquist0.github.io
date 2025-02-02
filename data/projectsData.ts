interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'ATLAS',
    description: `All Things Leave A Smudge!`,
    imgSrc: '/static/images/atlas.png',
    href: 'https://www.physics.lbl.gov/atlas/',
  },
  {
    title: 'Evolutionary Blackjack',
    description: `What if machine learning were as slow and error prone as real-life evolution? Could we still teach a computer when to double down? `,
    imgSrc: '/static/images/blackjack.gif',
    href: 'https://github.com/chultquist0/cmse202group11',
  },
  {
    title: 'Randomized Circuits',
    description: `A random grid array of resistors, capacitors, inductors, and diodes ... much to think about `,
    imgSrc: '/static/images/sniping.png',
    href: 'https://github.com/chultquist0/pairproject482/blob/main/Circuit.ipynb',
  },
]

export default projectsData
