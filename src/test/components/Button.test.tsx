import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Continuar</Button>)
    expect(screen.getByText('Continuar')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-gold')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-surface-light')
  })

  it('handles disabled state', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('merges custom className', () => {
    render(<Button className="extra-class">Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('extra-class')
  })
})
