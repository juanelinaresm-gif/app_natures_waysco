const cop = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** 70000 → "$70.000" */
export function formatAmount(valueCOP: number) {
  return `$${cop.format(valueCOP)}`
}

/** 70000 → "$70.000 COP" */
export function formatPrice(valueCOP: number) {
  return `${formatAmount(valueCOP)} COP`
}
