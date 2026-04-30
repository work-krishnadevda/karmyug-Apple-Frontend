/**
 * Net payable days (same line items as the attendance summary cards):
 *   Present + (Half day / 2) + Weekly Off (first card) + WOP + (WOH / 2)
 *   + Holiday + Official Leave + CL (L-CL) − (total Double Deduction days)
 *
 * "Weekly Off" on the first card is `totals.weekly_off` after merge
 * (plain + WOP + WOH as day rows); WOP and WOH are added at payable
 * weight (WOP = 1, WOH = 0.5 each) per product rule.
 */
export function computeNetPayableDays(totals) {
  if (!totals || typeof totals !== 'object') return 0
  const p = Number(totals.present) || 0
  const halfDay = (Number(totals.half_day) || 0) * 0.5
  const woLine = Number(totals.weekly_off) || 0
  const wop = Number(totals.weekly_off_present) || 0
  const woh = (Number(totals.weekly_off_half) || 0) * 0.5
  const h = Number(totals.holiday) || 0
  const ol = Number(totals.official_leave) || 0
  const cl = Number(totals.leave_cl) || 0
  const dd = Number(totals.double_deduction) || 0
  const gross = p + halfDay + woLine + wop + woh + h + ol + cl
  return Math.max(0, gross - dd)
}
