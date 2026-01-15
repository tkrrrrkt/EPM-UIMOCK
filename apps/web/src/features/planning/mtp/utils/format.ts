export function formatAmount(amount: string | number): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  if (isNaN(num)) return "0"

  // Format as Japanese currency (億円 or 百万円)
  const oku = num / 100000000 // 億円
  if (Math.abs(oku) >= 1) {
    return `${oku.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}`
  }

  const million = num / 1000000 // 百万円
  return `${million.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`
}

export function parseAmount(formatted: string): string {
  const cleaned = formatted.replace(/[,]/g, "")
  const num = Number.parseFloat(cleaned)
  if (isNaN(num)) return "0"

  return (num * 100000000).toString() // 億円 → 円
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}
