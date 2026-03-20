import { request } from './request';

// ==================== BOARDS ====================

/**
 * Fetch a single board
 * @param {number} id - Board ID
 * @returns {Promise<object>} - Board object
 */
export async function getBoard(id) {
  return request(`/boards/${id}`);
}

/**
 * Fetch all boards
 * @returns {Promise<Array>} - Array of board objects
 */
export async function getBoards() {
  return request('/boards');
}

/**
 * Create a new board
 * @param {object} boardData - Board attributes {title}
 * @returns {Promise<object>} - Created board object
 */
export async function createBoard(boardData) {
  return request('/boards', {
    method: 'POST',
    body: JSON.stringify({ board: boardData })
  });
}

/**
 * Update an existing board
 * @param {number} id - Board ID
 * @param {object} boardData - Board attributes to update
 * @returns {Promise<object>} - Updated board object
 */
export async function updateBoard(id, boardData) {
  return request(`/boards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ board: boardData })
  });
}

/**
 * Delete a board
 * @param {number} id - Board ID
 * @returns {Promise<null>} - null on success
 */
export async function deleteBoard(id) {
  return request(`/boards/${id}`, {
    method: 'DELETE'
  });
}

// ==================== LISTS ====================

/**
 * Fetch all lists (or filter by board_id client-side)
 * Note: Rails doesn't have a GET /lists route, so this fetches from boards
 * @param {number} boardId - Board ID to fetch lists for
 * @returns {Promise<Array>} - Array of list objects
 */
export async function getLists(boardId) {
  const board = await request(`/boards/${boardId}`);
  return board.lists || [];
}

/**
 * Create a new list
 * @param {number} boardId - Parent board ID
 * @param {object} listData - List attributes {title, position}
 * @returns {Promise<object>} - Created list object
 */
export async function createList(boardId, listData) {
  return request(`/boards/${boardId}/lists`, {
    method: 'POST',
    body: JSON.stringify({ list: listData })
  });
}

/**
 * Update an existing list
 * @param {number} id - List ID
 * @param {object} listData - List attributes to update
 * @returns {Promise<object>} - Updated list object
 */
export async function updateList(id, listData) {
  return request(`/lists/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ list: listData })
  });
}

export async function deleteList(id, options = {}) {
  const body = options.transfer_list_id
    ? JSON.stringify({ list: { transfer_list_id: options.transfer_list_id } })
    : undefined;

  return request(`/lists/${id}`, {
    method: 'DELETE',
    ...(body ? { body } : {})
  });
}

// ==================== CARDS ====================

/**
 * Fetch all cards
 * @returns {Promise<Array>} - Array of card objects
 */
export async function getCards() {
  return request('/cards');
}

/**
 * Create a new card
 * @param {number} listId - Parent list ID
 * @param {object} cardData - Card attributes {title, description, position}
 * @returns {Promise<object>} - Created card object
 */
export async function createCard(listId, cardData) {
  return request(`/lists/${listId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ card: cardData })
  });
}

/**
 * Update an existing card
 * @param {number} id - Card ID
 * @param {object} cardData - Card attributes to update
 * @returns {Promise<object>} - Updated card object
 */
export async function updateCard(id, cardData) {
  return request(`/cards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ card: cardData })
  });
}

/**
 * Delete a card
 * @param {number} id - Card ID
 * @returns {Promise<null>} - null on success
 */
export async function deleteCard(id) {
  return request(`/cards/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Fetch all working memory entries
 * @returns {Promise<Array>} - Array of entry objects
 */
export async function getWorkingMemoryEntries() {
  return request('/working_memory_entries');
}

/**
 * Create a new working memory entry
 * @param {object} entryData - Entry attributes {content}
 * @returns {Promise<object>} - Created entry object
 */
export async function createWorkingMemoryEntry(entryData) {
  return request('/working_memory_entries', {
    method: 'POST',
    body: JSON.stringify({ entry: entryData })
  });
}

/**
 * Update an existing working memory entry
 * @param {number} id - Entry ID
 * @param {object} entryData - Entry attributes to update
 * @returns {Promise<object>} - Updated entry object
 */
export async function updateWorkingMemoryEntry(id, entryData) {
  return request(`/working_memory_entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ entry: entryData })
  });
}

/**
 * Delete a working memory entry
 * @param {number} id - Entry ID
 * @returns {Promise<null>} - null on success
 */
export async function deleteWorkingMemoryEntry(id) {
  return request(`/working_memory_entries/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Delete all working memory entries
 * @returns {Promise<null>} - null on success
 */
export async function clearWorkingMemory() {
  return request('/working_memory_entries/destroy_all', {
    method: 'DELETE'
  });
}
