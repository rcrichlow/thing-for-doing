class CreateWorkingMemoryEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :working_memory_entries do |t|
      t.text :content

      t.timestamps
    end
  end
end
