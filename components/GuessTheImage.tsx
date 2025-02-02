'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

const images = [
  { src: '/static/images/image1.jpg', class: 'c' },
  { src: '/static/images/image2.jpg', class: 'b' },
]

type ChartDataItem = {
  score: number
  c: number
  b: number
  cFill: number
  bFill: number
}

type DistributionEntry = {
  score: number
  c: number
  b: number
  cFill: number
  bFill: number
}

const GuessTheImage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sliderValue, setSliderValue] = useState(1)
  const [userGuesses, setUserGuesses] = useState<{ score: number; class: string }[]>([])
  const [finished, setFinished] = useState(false)
  const [distributionData, setDistributionData] = useState<ChartDataItem[]>([])
  const [aucScore, setAucScore] = useState(-1)

  const handleNextImage = () => {
    // Save user's guess and class for the current image
    setUserGuesses((prev) => [
      ...prev,
      { score: sliderValue, class: images[currentImageIndex].class },
    ])

    // Move to the next image
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1)
      setSliderValue(1)
    } else {
      const score = calculateDistribution()
      setAucScore(score)
    }
  }

  const calculateAUCScore = (classCScores, classBScores) => {
    // 1 for 'c', 0 for 'b'
    const filteredClassCScores = classCScores.filter((score) => score !== 0)
    console.log('class c', filteredClassCScores)
    console.log('class b', classBScores)
    const labels = filteredClassCScores
      .map((score) => ({ score, label: 1 }))
      .concat(classBScores.map((score) => ({ score, label: 0 })))

    labels.sort((a, b) => b.score - a.score)
    console.log(labels)

    let tp = 0 // True Positive
    let fp = 0 // False Positive
    const totalPositive = filteredClassCScores.length
    const totalNegative = classBScores.length

    const tpr = [0] // True Positive Rate
    const fpr = [0] // False Positive Rate

    for (const { score, label } of labels) {
      if (label === 1) tp++
      else fp++
      tpr.push(tp / totalPositive)
      fpr.push(fp / totalNegative)
    }

    // trapezoidal rule
    let auc = 0
    for (let i = 1; i < tpr.length; i++) {
      auc += ((fpr[i] - fpr[i - 1]) * (tpr[i] + tpr[i - 1])) / 2
    }

    if (auc < 0.5) {
      auc = 1 - auc
    }
    return auc
  }

  const calculateDistribution = () => {
    interface Scores {
      c: number[]
      b: number[]
    }

    const scores: Scores = { c: [], b: [] }
    userGuesses.forEach((guess) => {
      if (guess.class === 'c') {
        scores.c.push(guess.score)
      } else {
        scores.b.push(guess.score)
      }
    })
    scores.c.push(images[currentImageIndex].class === 'c' ? sliderValue : 0)
    scores.b.push(images[currentImageIndex].class === 'b' ? sliderValue : 0)

    const chartData: ChartDataItem[] = []
    const maxScore = 5
    let cumulativeC = 0
    let cumulativeB = 0

    console.log('Scores', scores)

    for (let i = 1; i <= maxScore; i++) {
      const cCount = scores.c.filter((score) => score === i).length
      const bCount = scores.b.filter((score) => score === i).length

      cumulativeC += cCount
      cumulativeB += bCount

      chartData.push({ score: i, c: cCount, b: bCount, cFill: cumulativeC, bFill: cumulativeB })
    }
    console.log('Chart data at calcDist', chartData)
    setDistributionData(chartData)
    console.log('SCORES', scores)

    console.log('AUCScore', calculateAUCScore(scores.c, scores.b))
    setFinished(true)
    return calculateAUCScore(scores.c, scores.b)
  }

  const handleRestart = () => {
    setCurrentImageIndex(0)
    setUserGuesses([])
    setSliderValue(1)
    setFinished(false)
    setDistributionData([])
  }

  const prepareChartData = () => {
    const data: DistributionEntry[] = []
    const maxScore = 5 // Scores range from 1 to 5
    console.log('Distribution Data:', distributionData)

    for (let i = 1; i <= maxScore; i++) {
      // Find the distribution object for the current score
      const distributionEntry = distributionData.find((entry) => entry.score === i)

      // If found, use its values; otherwise default to zeros
      const cCount = distributionEntry ? distributionEntry.c : 0
      const bCount = distributionEntry ? distributionEntry.b : 0

      data.push({
        score: i,
        c: cCount,
        b: bCount,
        cFill: distributionEntry ? distributionEntry.cFill : 0,
        bFill: distributionEntry ? distributionEntry.bFill : 0,
      })
    }

    console.log('Chart data prepared:', data)
    return data
  }

  const chartData = prepareChartData()

  return (
    <div className="mx-auto max-w-lg rounded border border-gray-300 p-4 shadow-lg">
      {!finished ? (
        <>
          <h2 className="mb-4 text-2xl font-semibold">Test your B-Tagging!</h2>
          <img src={images[currentImageIndex].src} className="mb-4 h-auto w-64 rounded" />
          <p className="text-md mb-2">
            {' '}
            {currentImageIndex + 1} / {images.length}
          </p>
          <div className="mb-4">
            <label className="mb-2 block" htmlFor="jetScore">
              {' '}
              Assign this jet a b-tagging score:
            </label>
            <input id="jetScore" type="text" />
            <input
              type="range"
              min="1"
              max="5"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full"
              style={{
                backgroundSize: '100% 100%',
                backgroundImage:
                  'linear-gradient(to right, #00C49F 0%, #00C49F ' +
                  sliderValue * 20 +
                  '%, #ddd ' +
                  sliderValue * 20 +
                  '%, #ddd 100%)',
              }}
              step="1" // Ensures discrete steps
            />
            <div className="mt-2 flex w-full justify-between">
              <span className="text-xs">1</span>
              <span className="text-xs">2</span>
              <span className="text-xs">3</span>
              <span className="text-xs">4</span>
              <span className="text-xs">5</span>
            </div>
          </div>
          <button onClick={handleNextImage} className="rounded bg-green-500 px-4 py-2 text-white">
            Next Image
          </button>
        </>
      ) : (
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-semibold">Your Results!</h2>
          <h3 className="mb-4">Score Distributions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="score"
                label={{ value: 'Score', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="c"
                stroke="#00C49F"
                fill="#00C49F"
                fillOpacity={0.2}
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="b"
                stroke="#FFBB28"
                fill="#FFBB28"
                fillOpacity={0.2}
                strokeWidth={3}
              />
              <Line type="monotone" dataKey="c" stroke="#00C49F" strokeWidth={3} />
              <Line type="monotone" dataKey="b" stroke="#FFBB28" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>

          <button onClick={handleRestart} className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
            Restart Quiz
          </button>
          <h3 className="mb-4">AUC: {aucScore}</h3>
        </div>
      )}
    </div>
  )
}

export default GuessTheImage
