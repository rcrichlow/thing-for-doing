# frozen_string_literal: true

class Board < ApplicationRecord
  has_many :lists, -> { order(:position, :id) }, dependent: :destroy

  validates :title, presence: true
end
