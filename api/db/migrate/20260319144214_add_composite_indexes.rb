class AddCompositeIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :cards, [:list_id, :position], name: "index_cards_on_list_id_and_position"
    add_index :lists, [:board_id, :position], name: "index_lists_on_board_id_and_position"
  end
end
