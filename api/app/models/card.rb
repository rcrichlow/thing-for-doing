# frozen_string_literal: true

class Card < ApplicationRecord
  belongs_to :list

  validates :title, presence: true

  after_create_commit :normalize_positions_after_create

  def move_to_position!(target_list_id:, target_position:)
    Card.transaction do
      source_list_id = list_id
      destination_list_id = target_list_id || source_list_id
      normalized_target_position = target_position.nil? ? nil : target_position.to_i

      destination_scope = Card.where(list_id: destination_list_id).where.not(id: id).order(:position, :id).to_a
      bounded_position = [[normalized_target_position || destination_scope.length, 0].max, destination_scope.length].min

      update!(list_id: destination_list_id, position: bounded_position)

      if source_list_id == destination_list_id
        reordered_cards = destination_scope.dup
        reordered_cards.insert(bounded_position, self)
        self.class.normalize_scope_positions(reordered_cards)
      else
        source_scope = Card.where(list_id: source_list_id).where.not(id: id).order(:position, :id).to_a
        self.class.normalize_scope_positions(source_scope)

        destination_scope.insert(bounded_position, self)
        self.class.normalize_scope_positions(destination_scope)
      end

      reload
    end
  end

  def self.normalize_scope_positions(cards)
    cards.each_with_index do |card, index|
      next if card.position == index

      card.update_column(:position, index)
    end
  end

  private

  def normalize_positions_after_create
    siblings = Card.where(list_id: list_id).where.not(id: id).order(:position, :id).to_a
    target_position = position.nil? ? siblings.length : position.to_i
    bounded_position = [[target_position, 0].max, siblings.length].min

    siblings.insert(bounded_position, self)
    self.class.normalize_scope_positions(siblings)
  end
end
