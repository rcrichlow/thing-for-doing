import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import { BoardProvider } from '../context/BoardContext'

vi.mock('../services/api', () => ({
  getBoards: vi.fn().mockResolvedValue([]),
  createBoard: vi.fn(),
  updateBoard: vi.fn(),
  deleteBoard: vi.fn(),
  getLists: vi.fn().mockResolvedValue([]),
  createList: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
  getCards: vi.fn().mockResolvedValue([]),
  createCard: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
}));

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <BoardProvider>
        <App />
      </BoardProvider>
    )
  }

  it('renders the main layout and boards index by default', async () => {
    renderApp()
    
    expect(screen.getByText('Thing For Doing')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Boards/i })).toBeInTheDocument()
    
    expect(await screen.findByText('Your Boards')).toBeInTheDocument()
  })
})
