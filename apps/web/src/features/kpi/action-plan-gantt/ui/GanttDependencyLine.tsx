"use client"

interface GanttDependencyLineProps {
  sourceLeft: number
  sourceTop: number
  targetLeft: number
  targetTop: number
}

export function GanttDependencyLine({
  sourceLeft,
  sourceTop,
  targetLeft,
  targetTop,
}: GanttDependencyLineProps) {
  // Calculate path for dependency line (finish-to-start)
  const midX = sourceLeft + (targetLeft - sourceLeft) / 2
  const arrowSize = 6

  // Create SVG path for the dependency line
  const pathD = `
    M ${sourceLeft} ${sourceTop}
    L ${midX} ${sourceTop}
    L ${midX} ${targetTop}
    L ${targetLeft - arrowSize} ${targetTop}
  `

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 10 }}
    >
      {/* Main line */}
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-muted-foreground"
      />

      {/* Arrow head */}
      <polygon
        points={`
          ${targetLeft},${targetTop}
          ${targetLeft - arrowSize},${targetTop - arrowSize / 2}
          ${targetLeft - arrowSize},${targetTop + arrowSize / 2}
        `}
        className="fill-muted-foreground"
      />
    </svg>
  )
}
