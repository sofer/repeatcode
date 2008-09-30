class CreateQuestions < ActiveRecord::Migration
  def self.up
    create_table :questions do |t|
      t.integer :course_id
      t.integer :exercise_id
      t.integer :current_interval
      t.datetime :next_datetime

      t.timestamps
    end
  end

  def self.down
    drop_table :questions
  end
end
