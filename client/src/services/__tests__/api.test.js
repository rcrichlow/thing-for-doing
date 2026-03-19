import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from '../api';

// Mock global fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Helper', () => {
    it('makes a successful GET request', async () => {
      const mockData = [{ id: 1, title: 'Test' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const result = await api.getBoards();

      expect(fetch).toHaveBeenCalledWith('/api/boards', expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })
      }));
      expect(result).toEqual(mockData);
    });

    it('handles 204 No Content response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await api.deleteBoard(1);

      expect(result).toBeNull();
    });

    it('throws error on failed request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ errors: ['Board not found'] })
      });

      await expect(api.getBoard(999)).rejects.toThrow('Board not found');
    });

    it('throws error with status text when error data unavailable', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(api.getBoards()).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('Board API', () => {
    it('fetches a single board', async () => {
      const mockBoard = { id: 1, title: 'Test Board', lists: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBoard
      });

      const result = await api.getBoard(1);

      expect(fetch).toHaveBeenCalledWith('/api/boards/1', expect.any(Object));
      expect(result).toEqual(mockBoard);
    });

    it('fetches all boards', async () => {
      const mockBoards = [{ id: 1, title: 'Board 1' }, { id: 2, title: 'Board 2' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBoards
      });

      const result = await api.getBoards();

      expect(fetch).toHaveBeenCalledWith('/api/boards', expect.any(Object));
      expect(result).toEqual(mockBoards);
    });

    it('creates a board', async () => {
      const newBoard = { id: 1, title: 'New Board' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newBoard
      });

      const result = await api.createBoard({ title: 'New Board' });

      expect(fetch).toHaveBeenCalledWith('/api/boards', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ board: { title: 'New Board' } })
      }));
      expect(result).toEqual(newBoard);
    });

    it('updates a board', async () => {
      const updatedBoard = { id: 1, title: 'Updated Board' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedBoard
      });

      const result = await api.updateBoard(1, { title: 'Updated Board' });

      expect(fetch).toHaveBeenCalledWith('/api/boards/1', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ board: { title: 'Updated Board' } })
      }));
      expect(result).toEqual(updatedBoard);
    });

    it('deletes a board', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await api.deleteBoard(1);

      expect(fetch).toHaveBeenCalledWith('/api/boards/1', expect.objectContaining({
        method: 'DELETE'
      }));
      expect(result).toBeNull();
    });
  });

  describe('List API', () => {
    it('fetches lists for a board', async () => {
      const mockBoard = { id: 1, title: 'Board', lists: [{ id: 101, title: 'List 1' }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBoard
      });

      const result = await api.getLists(1);

      expect(fetch).toHaveBeenCalledWith('/api/boards/1', expect.any(Object));
      expect(result).toEqual(mockBoard.lists);
    });

    it('creates a list', async () => {
      const newList = { id: 101, title: 'New List', board_id: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newList
      });

      const result = await api.createList(1, { title: 'New List' });

      expect(fetch).toHaveBeenCalledWith('/api/boards/1/lists', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ list: { title: 'New List' } })
      }));
      expect(result).toEqual(newList);
    });

    it('updates a list', async () => {
      const updatedList = { id: 101, title: 'Updated List' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedList
      });

      const result = await api.updateList(101, { title: 'Updated List' });

      expect(fetch).toHaveBeenCalledWith('/api/lists/101', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ list: { title: 'Updated List' } })
      }));
      expect(result).toEqual(updatedList);
    });

    it('deletes a list', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await api.deleteList(101);

      expect(fetch).toHaveBeenCalledWith('/api/lists/101', expect.objectContaining({
        method: 'DELETE'
      }));
      expect(result).toBeNull();
    });
  });

  describe('Card API', () => {
    it('fetches all cards', async () => {
      const mockCards = [{ id: 201, title: 'Card 1' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCards
      });

      const result = await api.getCards();

      expect(fetch).toHaveBeenCalledWith('/api/cards', expect.any(Object));
      expect(result).toEqual(mockCards);
    });

    it('creates a card', async () => {
      const newCard = { id: 201, title: 'New Card', list_id: 101 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newCard
      });

      const result = await api.createCard(101, { title: 'New Card' });

      expect(fetch).toHaveBeenCalledWith('/api/lists/101/cards', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ card: { title: 'New Card' } })
      }));
      expect(result).toEqual(newCard);
    });

    it('updates a card', async () => {
      const updatedCard = { id: 201, title: 'Updated Card', list_id: 102 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedCard
      });

      const result = await api.updateCard(201, { title: 'Updated Card', list_id: 102 });

      expect(fetch).toHaveBeenCalledWith('/api/cards/201', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ card: { title: 'Updated Card', list_id: 102 } })
      }));
      expect(result).toEqual(updatedCard);
    });

    it('deletes a card', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await api.deleteCard(201);

      expect(fetch).toHaveBeenCalledWith('/api/cards/201', expect.objectContaining({
        method: 'DELETE'
      }));
      expect(result).toBeNull();
    });
  });

});
