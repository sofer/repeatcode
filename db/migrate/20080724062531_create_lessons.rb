class CreateLessons < ActiveRecord::Migration
  def self.up
    create_table :lessons do |t|
      t.integer :course_id
      t.integer :correct_responses

      t.timestamps
    end
  end

  def self.down
    drop_table :lessons
  end
end
