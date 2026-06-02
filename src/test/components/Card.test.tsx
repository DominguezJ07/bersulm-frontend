import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '@/components/ui'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Contenido</Card>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-card">Contenido</Card>)
    expect(screen.getByText('Contenido').className).toContain('custom-card')
  })
})
