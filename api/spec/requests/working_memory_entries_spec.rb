# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'WorkingMemoryEntries API', type: :request do
  describe 'GET /working_memory_entries' do
    before { WorkingMemoryEntry.destroy_all }

    it 'returns all working memory entries' do
      WorkingMemoryEntry.create!(content: 'First entry')
      WorkingMemoryEntry.create!(content: 'Second entry')

      get '/working_memory_entries'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.map { |entry| entry['content'] }).to eq(['First entry', 'Second entry'])
    end
  end

  describe 'POST /working_memory_entries' do
    it 'creates a working memory entry' do
      post '/working_memory_entries', params: { entry: { content: 'Remember this' } }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['content']).to eq('Remember this')
      expect(WorkingMemoryEntry.last.content).to eq('Remember this')
    end

    it 'returns errors for invalid data' do
      post '/working_memory_entries', params: {}

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['errors'].first).to include('param is missing')
    end

    it 'returns validation errors for blank content' do
      post '/working_memory_entries', params: { entry: { content: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Content can't be blank")
    end
  end

  describe 'PATCH /working_memory_entries/:id' do
    it 'updates a working memory entry' do
      entry = WorkingMemoryEntry.create!(content: 'Original')

      patch "/working_memory_entries/#{entry.id}", params: { entry: { content: 'Updated' } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['content']).to eq('Updated')
      expect(entry.reload.content).to eq('Updated')
    end

    it 'returns a structured 404 for a missing entry' do
      patch '/working_memory_entries/999999', params: { entry: { content: 'Updated' } }

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('WorkingMemoryEntry not found')
    end

    it 'returns validation errors for blank content' do
      entry = WorkingMemoryEntry.create!(content: 'Original')

      patch "/working_memory_entries/#{entry.id}", params: { entry: { content: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json['errors']).to include("Content can't be blank")
    end
  end

  describe 'DELETE /working_memory_entries/:id' do
    it 'deletes a working memory entry' do
      entry = WorkingMemoryEntry.create!(content: 'Delete me')
      entry_id = entry.id

      delete "/working_memory_entries/#{entry_id}"

      expect(response).to have_http_status(:no_content)
      expect(WorkingMemoryEntry.find_by(id: entry_id)).to be_nil
    end
  end

  describe 'DELETE /working_memory_entries/destroy_all' do
    it 'deletes all working memory entries' do
      WorkingMemoryEntry.create!(content: 'First')
      WorkingMemoryEntry.create!(content: 'Second')

      delete '/working_memory_entries/destroy_all'

      expect(response).to have_http_status(:no_content)
      expect(WorkingMemoryEntry.count).to eq(0)
    end
  end
end
