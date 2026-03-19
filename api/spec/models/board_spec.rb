# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Board, type: :model do
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
  end

  describe 'validations' do
    it 'requires a title' do
      board = Board.new(title: nil)

      expect(board).not_to be_valid
      expect(board.errors[:title]).to include("can't be blank")
    end
  end
end
