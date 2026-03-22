import { describe, it, expect } from 'vitest'
import { rowsToCSV } from '@/lib/exports'

describe('rowsToCSV', () => {
  it('produces headers and escapes values', () => {
    const rows = [
      { A: 'plain', B: 'comma,value', C: 'quote"value', D: 'multi\nline' },
      { A: 'x', B: '', C: 'y', D: 'z' },
    ]
    const csv = rowsToCSV(rows)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('A,B,C,D')
    // Check escaping (quotes doubled, wrapped in quotes when needed)
    expect(lines[1]).toContain('"comma,value"')
    expect(lines[1]).toContain('"quote""value""')
    expect(lines[1]).toContain('"multi\nline"')
  })
})