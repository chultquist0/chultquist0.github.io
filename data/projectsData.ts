interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Room Planner',
    description: `Drag-and-drop furniture layout tool for planning a 15×15 ft room with a bay window.`,
    href: '/room-planner',
  },
  {
    title: 'ATLAS',
    description: `The world's largest particle detector, located at the Large Hadron Collider at CERN. `,
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
    description: `What are the electrical properties of a random grid array of resistors, capacitors, inductors, and diodes? `,
    imgSrc: '/static/images/sniping.png',
    href: 'https://github.com/chultquist0/pairproject482/blob/main/Circuit.ipynb',
  },
]

export default projectsData
