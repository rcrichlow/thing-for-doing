#frozen_string_literal: true

class WorkingMemoryEntry < ApplicationRecord
    validates :content, presence: true
end
