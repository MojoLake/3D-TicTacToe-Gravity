// Pre-compute all 76 winning lines for a 4x4x4 grid
// Each line is an array of 4 [x, y, z] coordinates

const SIZE = 4

function generateWinningLines() {
  const lines = []

  // 1. Rows along X-axis (16 lines: 4 per YZ plane)
  for (let y = 0; y < SIZE; y++) {
    for (let z = 0; z < SIZE; z++) {
      lines.push([
        [0, y, z], [1, y, z], [2, y, z], [3, y, z]
      ])
    }
  }

  // 2. Columns along Y-axis (16 lines: 4x4 grid of vertical lines)
  for (let x = 0; x < SIZE; x++) {
    for (let z = 0; z < SIZE; z++) {
      lines.push([
        [x, 0, z], [x, 1, z], [x, 2, z], [x, 3, z]
      ])
    }
  }

  // 3. Pillars along Z-axis (16 lines)
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      lines.push([
        [x, y, 0], [x, y, 1], [x, y, 2], [x, y, 3]
      ])
    }
  }

  // 4. XY plane diagonals (8 lines: 2 per Z level)
  for (let z = 0; z < SIZE; z++) {
    lines.push([
      [0, 0, z], [1, 1, z], [2, 2, z], [3, 3, z]
    ])
    lines.push([
      [3, 0, z], [2, 1, z], [1, 2, z], [0, 3, z]
    ])
  }

  // 5. XZ plane diagonals (8 lines: 2 per Y level)
  for (let y = 0; y < SIZE; y++) {
    lines.push([
      [0, y, 0], [1, y, 1], [2, y, 2], [3, y, 3]
    ])
    lines.push([
      [3, y, 0], [2, y, 1], [1, y, 2], [0, y, 3]
    ])
  }

  // 6. YZ plane diagonals (8 lines: 2 per X level)
  for (let x = 0; x < SIZE; x++) {
    lines.push([
      [x, 0, 0], [x, 1, 1], [x, 2, 2], [x, 3, 3]
    ])
    lines.push([
      [x, 3, 0], [x, 2, 1], [x, 1, 2], [x, 0, 3]
    ])
  }

  // 7. Space diagonals (4 lines: corner to corner through the cube)
  lines.push([
    [0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]
  ])
  lines.push([
    [3, 0, 0], [2, 1, 1], [1, 2, 2], [0, 3, 3]
  ])
  lines.push([
    [0, 3, 0], [1, 2, 1], [2, 1, 2], [3, 0, 3]
  ])
  lines.push([
    [0, 0, 3], [1, 1, 2], [2, 2, 1], [3, 3, 0]
  ])

  return lines
}

export const WINNING_LINES = generateWinningLines()
export const GRID_SIZE = SIZE

