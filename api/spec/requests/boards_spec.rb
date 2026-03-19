# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Boards API', type: :request do
  describe 'GET /boards' do
    before { Board.destroy_all }

    it 'returns all boards with nested associations' do
      board = Board.create!(title: 'My Board')
      list = board.lists.create!(title: 'My List')
      list.cards.create!(title: 'My Card')

      get '/boards'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['title']).to eq('My Board')
      expect(json[0]['lists']).to be_an(Array)
      expect(json[0]['lists'][0]['cards']).to be_an(Array)
    end
  end

  describe 'GET /boards/:id' do
    it 'returns a specific board with nested associations' do
      board = Board.create!(title: 'My Board')
      board.lists.create!(title: 'My List')

      get "/boards/#{board.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('My Board')
      expect(json['lists'].length).to eq(1)
    end

    it 'returns lists and cards ordered by position' do
      board = Board.create!(title: 'My Board')
      later_list = board.lists.create!(title: 'Later', position: 1)
      earlier_list = board.lists.create!(title: 'Earlier', position: 0)
      later_list.cards.create!(title: 'Later Card', position: 1)
      later_list.cards.create!(title: 'Sooner Card', position: 0)

      get "/boards/#{board.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['lists'].map { |list| list['title'] }).to eq(['Earlier', 'Later'])
      expect(json['lists'][1]['cards'].map { |card| card['title'] }).to eq(['Sooner Card', 'Later Card'])
    end

    it 'returns a structured 404 for a missing board' do
      get '/boards/999999'

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('Board not found')
    end
  end

  describe 'POST /boards' do
    it 'creates a new board' do
      post '/boards', params: { board: { title: 'New Board' } }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New Board')
      expect(Board.last.title).to eq('New Board')
    end

    it 'returns errors for invalid data' do
      post '/boards', params: {}

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['errors'].first).to include('param is missing')
    end

    it 'returns validation errors for a blank title' do
      post '/boards', params: { board: { title: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Title can't be blank")
    end
  end

  describe 'PATCH /boards/:id' do
    it 'updates a board' do
      board = Board.create!(title: 'Old Title')

      patch "/boards/#{board.id}", params: { board: { title: 'New Title' } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('New Title')
      expect(board.reload.title).to eq('New Title')
    end

    it 'returns validation errors for an invalid update payload' do
      board = Board.create!(title: 'Original')

      patch "/boards/#{board.id}", params: { board: { title: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Title can't be blank")
    end
  end

  describe 'DELETE /boards/:id' do
    it 'deletes a board' do
      board = Board.create!(title: 'Delete Me')
      board_id = board.id

      delete "/boards/#{board_id}"

      expect(response).to have_http_status(:no_content)
      expect(Board.find_by(id: board_id)).to be_nil
    end
  end
end
