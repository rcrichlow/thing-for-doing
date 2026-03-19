# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Cards API', type: :request do
  describe 'GET /cards' do
    before { Board.destroy_all }

    it 'returns all cards' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')
      list.cards.create!(title: 'My Card')

      get '/cards'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['title']).to eq('My Card')
    end
  end

  describe 'GET /cards/:id' do
    it 'returns a specific card' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')
      card = list.cards.create!(title: 'My Card')

      get "/cards/#{card.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('My Card')
    end

    it 'returns a structured 404 for a missing card' do
      get '/cards/999999'

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('Card not found')
    end
  end

  describe 'POST /lists/:list_id/cards' do
    it 'creates a card under a list' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')

      post "/lists/#{list.id}/cards", params: { card: { title: 'New Card', description: 'Details', position: 1 } }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New Card')
      expect(json['description']).to eq('Details')
      expect(list.cards.count).to eq(1)
    end

    it 'returns errors for invalid data' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')

      post "/lists/#{list.id}/cards", params: {}

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['errors'].first).to include('param is missing')
    end

    it 'returns validation errors for a blank title' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')

      post "/lists/#{list.id}/cards", params: { card: { title: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Title can't be blank")
    end
  end

  describe 'PATCH /cards/:id' do
    it 'updates a card' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')
      card = list.cards.create!(title: 'Old Title')

      patch "/cards/#{card.id}", params: { card: { title: 'New Title', description: 'Updated' } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New Title')
      expect(json['description']).to eq('Updated')
    end

    it 'can move a card to a different list' do
      board = Board.create!(title: 'My Board')
      list1 = board.lists.create!(title: 'List 1')
      list2 = board.lists.create!(title: 'List 2')
      card = list1.cards.create!(title: 'My Card')

      patch "/cards/#{card.id}", params: { card: { list_id: list2.id, position: 0 } }

      expect(response).to have_http_status(:ok)
      expect(card.reload.list_id).to eq(list2.id)
      expect(card.position).to eq(0)
    end

    it 'reorders cards within the same list and compacts sibling positions' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'List 1')
      first = list.cards.create!(title: 'First', position: 0)
      second = list.cards.create!(title: 'Second', position: 1)
      third = list.cards.create!(title: 'Third', position: 2)

      patch "/cards/#{first.id}", params: { card: { position: 2 } }

      expect(response).to have_http_status(:ok)
      expect(list.cards.reload.pluck(:id, :position)).to eq([
        [second.id, 0],
        [third.id, 1],
        [first.id, 2]
      ])
    end

    it 'reorders cards when moving to a different list and compacts both lists' do
      board = Board.create!(title: 'My Board')
      source_list = board.lists.create!(title: 'Source')
      target_list = board.lists.create!(title: 'Target')
      source_first = source_list.cards.create!(title: 'Source First', position: 0)
      moved_card = source_list.cards.create!(title: 'Move Me', position: 1)
      target_first = target_list.cards.create!(title: 'Target First', position: 0)
      target_second = target_list.cards.create!(title: 'Target Second', position: 1)

      patch "/cards/#{moved_card.id}", params: { card: { list_id: target_list.id, position: 1 } }

      expect(response).to have_http_status(:ok)
      expect(source_list.cards.reload.pluck(:id, :position)).to eq([
        [source_first.id, 0]
      ])
      expect(target_list.cards.reload.pluck(:id, :position)).to eq([
        [target_first.id, 0],
        [moved_card.id, 1],
        [target_second.id, 2]
      ])
    end

    it 'returns validation errors for an invalid update payload' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')
      card = list.cards.create!(title: 'My Card')

      patch "/cards/#{card.id}", params: { card: { title: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Title can't be blank")
    end
  end

  describe 'DELETE /cards/:id' do
    it 'deletes a card' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')
      card = list.cards.create!(title: 'Delete Me')
      card_id = card.id

      delete "/cards/#{card_id}"

      expect(response).to have_http_status(:no_content)
      expect(Card.find_by(id: card_id)).to be_nil
    end
  end
end
