class CreateResponses < ActiveRecord::Migration
  def self.up
    create_table :responses do |t|
      t.integer :question_id
      t.integer :lesson_id
      t.integer :seconds_taken
      t.integer :interval
      t.string :content
      t.string :result

      t.timestamps
    end
  end

  def self.down
    drop_table :responses
  end
end
