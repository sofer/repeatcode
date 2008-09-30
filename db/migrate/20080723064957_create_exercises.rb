class CreateExercises < ActiveRecord::Migration
  def self.up
    create_table :exercises do |t|
      t.integer :topic_id
      t.integer :position
      t.string :description
      t.string :phrase
      t.string :response
      t.string :pattern
      t.text :notes

      t.timestamps
    end
  end

  def self.down
    drop_table :exercises
  end
end
