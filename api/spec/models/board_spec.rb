# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Board, type: :model do
  describe 'scopes' do
    before { Board.destroy_all }

    it 'returns only active boards from the active scope' do
      active_board = Board.create!(title: 'Active Board')
      Board.create!(title: 'Archived Board', archived_at: 1.day.ago)

      expect(Board.active).to contain_exactly(active_board)
    end

    it 'returns archived boards ordered by most recently archived first' do
      older_archived_board = Board.create!(title: 'Older Archived', archived_at: 2.days.ago)
      newer_archived_board = Board.create!(title: 'Newer Archived', archived_at: 1.day.ago)
      Board.create!(title: 'Active Board')

      expect(Board.archived).to eq([newer_archived_board, older_archived_board])
    end
  end

  describe 'associations' do
    it 'has many lists' do
      board = Board.create!(title: 'Test Board')
      list1 = board.lists.create!(title: 'List 1')
      list2 = board.lists.create!(title: 'List 2')

      expect(board.lists).to include(list1, list2)
      expect(board.lists.count).to eq(2)
    end

    it 'destroys dependent lists when board is destroyed' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'List 1')
      list_id = list.id

      board.destroy

      expect(List.find_by(id: list_id)).to be_nil
    end

    it 'cascades to lists and cards at the database level when callbacks are bypassed' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'List 1')
      card = list.cards.create!(title: 'Card 1')

      board.delete

      expect(List.find_by(id: list.id)).to be_nil
      expect(Card.find_by(id: card.id)).to be_nil
    end
  end

  describe 'validations' do
    it 'requires a title' do
      board = Board.new(title: nil)

      expect(board).not_to be_valid
      expect(board.errors[:title]).to include("can't be blank")
    end
  end

  describe '#archived?' do
    it 'returns true when archived_at is present' do
      board = Board.create!(title: 'Archived Board', archived_at: Time.current)

      expect(board).to be_archived
    end

    it 'returns false when archived_at is missing' do
      board = Board.create!(title: 'Active Board')

      expect(board).not_to be_archived
    end
  end

  describe '#archive!' do
    it 'sets archived_at on the board' do
      board = Board.create!(title: 'Archive Me')

      board.archive!

      expect(board.reload.archived_at).to be_present
      expect(board).to be_archived
    end
  end

  describe '#unarchive!' do
    it 'clears archived_at on the board' do
      board = Board.create!(title: 'Unarchive Me', archived_at: Time.current)

      board.unarchive!

      expect(board.reload.archived_at).to be_nil
      expect(board).not_to be_archived
    end
  end
end
