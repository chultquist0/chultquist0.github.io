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
  
  const fakeAnswer = [
    [
      ["f", "f", "f", "f"],
      ["f", "f", "f", "f"],
      ["f", "f", "f", "f"],
      ["f", "f", "f", "f"],
    ],
    [
      ["f", "f", "f", "f"],
      ["f", "", "", "f"],
      ["f", "", "", "f"],
      ["f", "f", "f", "f"],
    ],
    [
      ["f", "f", "f", "f"],
      ["f", "", "", "f"],
      ["f", "", "", "f"],
      ["f", "f", "f", "f"],
    ],
    [
      ["f", "f", "f", "f"],
      ["f", "f", "f", "f"],
      ["f", "f", "f", "f"],
      ["f", "f", "f", "f"],
    ],
  ];
  
  function do_cubes_match(cubes) {
    for (cube of cubes) {
      const matches =
        cube.letter == answer[cube.grid_pos.z][cube.grid_pos.y][cube.grid_pos.x];
      if (!matches) return false;
    }
    return true;
  }
  window.hints = hints;