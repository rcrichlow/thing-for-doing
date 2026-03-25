# frozen_string_literal: true

require 'rails_helper'

RSpec.describe List, type: :model do
  describe 'associations' do
    it 'belongs to a board' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'Test List')

      expect(list.board).to eq(board)
    end

    it 'has many cards' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'Test List')
      card1 = list.cards.create!(title: 'Card 1')
      card2 = list.cards.create!(title: 'Card 2')

      expect(list.cards).to include(card1, card2)
      expect(list.cards.count).to eq(2)
    end

    it 'destroys dependent cards when list is destroyed' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'Test List')
      card = list.cards.create!(title: 'Card 1')
      card_id = card.id

      list.destroy

      expect(Card.find_by(id: card_id)).to be_nil
    end

    it 'cascades to cards at the database level when callbacks are bypassed' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.create!(title: 'Test List')
      card = list.cards.create!(title: 'Card 1')

      list.delete

      expect(Card.find_by(id: card.id)).to be_nil
    end
  end

  describe 'validations' do
    it 'requires a title' do
      board = Board.create!(title: 'Test Board')
      list = board.lists.build(title: nil)

      expect(list).not_to be_valid
      expect(list.errors[:title]).to include("can't be blank")
    end
  end
end
