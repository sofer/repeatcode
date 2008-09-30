class LessonTweak < ActiveRecord::Migration
  def self.up
    add_column :lessons, :total_questions_started, :integer
  end

  def self.down
    remove_column :lessons, :total_questions_started
  end
end
