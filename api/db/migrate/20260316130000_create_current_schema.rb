class CreateCurrentSchema < ActiveRecord::Migration[8.1]
  def change
    create_table :boards do |t|
      t.string :title

      t.timestamps
    end

    create_table :lists do |t|
      t.references :board, null: false, foreign_key: true
      t.integer :position
      t.string :title

      t.timestamps
    end

    create_table :cards do |t|
      t.text :description
      t.references :list, null: false, foreign_key: true
      t.integer :position
      t.string :title

      t.timestamps
    end
  end
end
