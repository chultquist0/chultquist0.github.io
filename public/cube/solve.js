const date = "Thursday, Feb. 12, 2025"
const author = "Charlie Hultquist"

const answer = [
    [
      ["S", "C", "A", "M"],
      ["E", "R", "G", "O"],
      ["R", "E", "E", "D"],
      ["A", "D", "D", "S"],
    ],
    [
      ["A", "R", "G", "O"],
      ["P", "", "", "B"],
      ["E", "", "", "I"],
      ["S", "E", "A", "T"],
    ],
    [
      ["S", "U", "I", "T"],
      ["E", "", "", "O"],
      ["A", "", "", "T"],
      ["T", "E", "L", "E"],
    ],
    [
      ["H", "E", "S", "T"],
      ["E", "R", "I", "E"],
      ["M", "A", "R", "S"],
      ["I", "S", "I", "T"],
    ],
  ];
  
  const hints = {
    y: {
      1: "Boy Scout adornment",
      2: "Motley ______",
      3: "Data, HAL, Deep Thought, and others (abbr.)",
      4: "Applejuice eponym",
      5: "The point of fencing",
      6: "Wind up on stage?",
      7: "Roughly 500 sheets",
      8: "Three of them make an 'S', in Morse",
      9: "Bubbly bianco",
      10: "Just-above-failing grades",
      11: "Spanish Surrealist",
      12: '"Ignore This," in editor-speak',
    },
    x: {
      1: "Pig butchering, e.g.",
      5: "Therefore, to Descartes",
      7: "Jobs' Alma Mater",
      9: "Stirs in",
      13: "Jason's ship",
      15: "Spot in the House",
      16: "Lawyer's concern … and outfit, hopefully",
      18: "Port entrance?",
      19: "Bidding, old-style",
      23: "Spooky sounding lake",
      24: "Land of Opportunity?",
      25: '"Really?"',
    },
    z: {
      1: "Medical liquids",
      2: "Street _____",
      3: "Like a fine wine",
      4: "Game alterations",
      13: "Donkey and Diddy Kong",
      14: "Passing words?",
      16: "Rarity on a rush-hour train",
      17: "Reusable bag",
      19: "Greek half",
      20: "History textbook divisions",
      21: "iPhone assistant",
      22: "Class struggle?",
    },
  };

  const base_face = {
    y: {
      1: "back",
      2: "back",
      3: "back",
      4: "back",
      5: "left",
      6: "right",
      7: "left",
      8: "right",
      9: "front",
      10: "front",
      11: "front",
      12: 'front',
    },
    x: {
      1: "top",
      5: "top",
      7: "top",
      9: "top",
      13: "back",
      15: "front",
      16: "back",
      18: "front",
      19: "back",
      23: "bottom",
      24: "bottom",
      25: "front",
    },
    z: {
      1: "top",
      2: "top",
      3: "top",
      4: "top",
      13: "left",
      14: "right",
      16: "left",
      17: "right",
      19: "left",
      20: "bottom",
      21: "bottom",
      22: "right",
    },
  };
  
  const cubenumber = [
    [
      [1, 2, 3, 4],
      [5, "", "", 6],
      [7, "", "", 8],
      [9, 10, 11, 12],
    ],
    [
      [13, "", "", 14],
      ["", "", "", ""],
      ["", "", "", ""],
      [15, "", "", ""],
    ],
    [
      [16, "", "", 17],
      ["", "", "", ""],
      ["", "", "", ""],
      [18, "", "", ""],
    ],
    [
      [19, 20, 21, 22],
      [23, "", "", ""],
      [24, "", "", ""],
      [25, "", "", ""],
    ],
  ];
  

  window.hints = hints;