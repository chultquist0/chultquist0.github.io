interface Art {
  title: string
  desc: string
  imagePath: string
  alt: string
}

const artData: Art[] = [
  {
    title: 'The Campanile',
    desc: 'The Campanile and physics building at UC Berkeley',
    imagePath: '/static/images/campanile.png',
    alt: 'Isometric drawing of the campanile and surrounding plaza',
  },
  {
    title: 'Snakes as a Train',
    desc: 'A BART map depicted as coiled snakes in weeds. ',
    imagePath: '/static/images/BART.png',
    alt: 'A BART map depicted as coiled snakes in weeds',
  },
  {
    title: 'Dinnertime',
    desc: "Digital recreation of an image I saw in a book somewhere. A friend once taught me you can eat their flowers, and that they are slightly sweet. I've been unstoppable since. ",
    imagePath: '/static/images/Nasturtiums.png',
    alt: 'Stylized drawing of nasturtium flowers',
  },
  {
    title: 'Correspondance Card',
    desc: 'Intended to be mailed, but I have yet to actually get printed',
    imagePath: '/static/images/Correspond.png',
    alt: 'A correspondance card',
  },
]

export default artData
