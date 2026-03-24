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

    it 'excludes archived boards from the main board list' do
      Board.create!(title: 'Active Board')
      Board.create!(title: 'Archived Board', archived_at: Time.current)

      get '/boards'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.map { |board| board['title'] }).to eq(['Active Board'])
    end
  end

  describe 'GET /boards/archived' do
    before { Board.destroy_all }

    it 'returns archived boards with nested associations' do
      board = Board.create!(title: 'Archived Board', archived_at: Time.current)
      list = board.lists.create!(title: 'Archived List')
      list.cards.create!(title: 'Archived Card')
      Board.create!(title: 'Active Board')

      get '/boards/archived'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['title']).to eq('Archived Board')
      expect(json[0]['lists'][0]['cards'][0]['title']).to eq('Archived Card')
    end

    it 'orders archived boards by most recently archived first' do
      Board.create!(title: 'Older Archived', archived_at: 2.days.ago)
      Board.create!(title: 'Newer Archived', archived_at: 1.day.ago)

      get '/boards/archived'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.map { |board| board['title'] }).to eq(['Newer Archived', 'Older Archived'])
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
      board.lists.create!(title: 'Earlier', position: 0)
      later_list.cards.create!(title: 'Later Card', position: 1)
      later_list.cards.create!(title: 'Sooner Card', position: 0)

      get "/boards/#{board.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['lists'].map { |list| list['title'] }).to eq(%w[Earlier Later])
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

  describe 'PATCH /boards/:id/archive' do
    before { Board.destroy_all }

    it 'archives a board' do
      board = Board.create!(title: 'Archive Me')

      patch "/boards/#{board.id}/archive"

      expect(response).to have_http_status(:no_content)
      expect(board.reload).to be_archived
    end

    it 'keeps archived boards accessible from the show endpoint while hiding them from the main index' do
      board = Board.create!(title: 'Archive Me')

      patch "/boards/#{board.id}/archive"
      get '/boards'

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq([])

      get "/boards/#{board.id}"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['title']).to eq('Archive Me')
      expect(JSON.parse(response.body)['archived_at']).to be_present
    end

    it 'returns a structured 404 for a missing board' do
      patch '/boards/999999/archive'

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('Board not found')
    end
  end

  describe 'PATCH /boards/:id/unarchive' do
    before { Board.destroy_all }

    it 'unarchives a board' do
      board = Board.create!(title: 'Unarchive Me', archived_at: Time.current)

      patch "/boards/#{board.id}/unarchive"

      expect(response).to have_http_status(:no_content)
      expect(board.reload).not_to be_archived
    end

    it 'moves unarchived boards back to the main index and removes them from archived' do
      board = Board.create!(title: 'Unarchive Me', archived_at: Time.current)

      patch "/boards/#{board.id}/unarchive"
      get '/boards'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.map { |record| record['title'] }).to include('Unarchive Me')

      get '/boards/archived'

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq([])
    end

    it 'returns a structured 404 for a missing board' do
      patch '/boards/999999/unarchive'

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('Board not found')
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

    it 'returns a structured 404 for a missing board' do
      delete '/boards/999999'

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('Board not found')
    end

    it 'returns validation errors when destroy fails' do
      board = Board.create!(title: 'Cannot Delete Me')
      board.errors.add(:base, 'Board could not be deleted')

      allow(Board).to receive(:find).with(board.id.to_s).and_return(board)
      allow(board).to receive(:destroy!).and_raise(ActiveRecord::RecordNotDestroyed.new('failed to destroy', board))

      delete "/boards/#{board.id}"

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('Board could not be deleted')
    end
  end
end
