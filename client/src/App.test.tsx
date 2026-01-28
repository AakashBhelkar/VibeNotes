import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

describe('App', () => {
    it('renders headline', () => {
        render(<App />)
        const elements = screen.getAllByText('VibeNotes')
        expect(elements.length).toBeGreaterThan(0)
    })
})
