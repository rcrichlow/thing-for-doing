# frozen_string_literal: true

class List < ApplicationRecord
  belongs_to :board
  has_many :cards, -> { order(:position, :id) }, dependent: :destroy

  validates :title, presence: true
end
