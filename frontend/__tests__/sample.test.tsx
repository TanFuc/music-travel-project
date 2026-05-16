/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import React from 'react'

describe('Sample Test', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true)
  })

  it('should render text correctly', () => {
    const TestComponent = () => <div>Hello World</div>
    render(<TestComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
