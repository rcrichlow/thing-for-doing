# frozen_string_literal: true

class Board < ApplicationRecord
  has_many :lists, -> { order(:position, :id) }, dependent: :destroy

  scope :active, -> { where(archived_at: nil) }
  scope :archived, -> { where.not(archived_at: nil).order(archived_at: :desc, id: :desc) }

  validates :title, presence: true

  def archived?
    archived_at.present?
  end

  def archive!
    update!(archived_at: Time.current)
  end

  def unarchive!
    update!(archived_at: nil)
  end
end
