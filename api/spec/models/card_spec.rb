# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Card, type: :model do
  describe 'associations' do
    it 'belongs to a list' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'Test List')
      card = list.cards.create!(title: 'Test Card')

      expect(card.list).to eq(list)
    end
  end

  describe 'validations' do
    it 'requires a title' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'Test List')
      card = list.cards.build(title: nil)

      expect(card).not_to be_valid
      expect(card.errors[:title]).to include("can't be blank")
    end
  end
end
