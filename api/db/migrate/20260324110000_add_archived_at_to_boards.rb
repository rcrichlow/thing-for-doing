class AddArchivedAtToBoards < ActiveRecord::Migration[8.1]
  def change
    add_column :boards, :archived_at, :datetime
    add_index :boards, :archived_at
  end
end
