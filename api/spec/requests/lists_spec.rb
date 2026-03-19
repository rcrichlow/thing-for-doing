# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Lists API', type: :request do
  describe 'POST /boards/:board_id/lists' do
    it 'creates a list under a board' do
      board = Board.create!(title: 'My Board')

      post "/boards/#{board.id}/lists", params: { list: { title: 'New List', position: 1 } }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New List')
      expect(json['position']).to eq(1)
      expect(board.lists.count).to eq(1)
    end

    it 'returns errors for invalid data' do
      board = Board.create!(title: 'My Board')

      post "/boards/#{board.id}/lists", params: {}

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['errors'].first).to include('param is missing')
    end

    it 'returns validation errors for a blank title' do
      board = Board.create!(title: 'My Board')

      post "/boards/#{board.id}/lists", params: { list: { title: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Title can't be blank")
    end
  end

  describe 'PATCH /lists/:id' do
    it 'updates a list' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'Old Title', position: 0)

      patch "/lists/#{list.id}", params: { list: { title: 'New Title', position: 2 } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New Title')
      expect(json['position']).to eq(2)
    end

    it 'returns a structured 404 for a missing list' do
      patch '/lists/999999', params: { list: { title: 'New Title' } }

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('List not found')
    end

    it 'returns validation errors for an invalid update payload' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'Old Title', position: 0)

      patch "/lists/#{list.id}", params: { list: { title: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Title can't be blank")
    end
  end

  describe 'DELETE /lists/:id' do
    it 'deletes a list' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'Delete Me')
      list_id = list.id

      delete "/lists/#{list_id}"

      expect(response).to have_http_status(:no_content)
      expect(List.find_by(id: list_id)).to be_nil
    end
  end
end
