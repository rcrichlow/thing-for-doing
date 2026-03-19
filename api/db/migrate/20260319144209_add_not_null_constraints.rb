class AddNotNullConstraints < ActiveRecord::Migration[8.1]
  def change
    change_column_null :boards, :title, false
    change_column_null :lists, :title, false
    change_column_null :cards, :title, false
    change_column_null :working_memory_entries, :content, false
  end
end
