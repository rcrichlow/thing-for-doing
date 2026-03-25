# frozen_string_literal: true

class AddCascadeDeleteToBoardHierarchy < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :cards, :lists
    remove_foreign_key :lists, :boards

    add_foreign_key :lists, :boards, on_delete: :cascade
    add_foreign_key :cards, :lists, on_delete: :cascade
  end
end
