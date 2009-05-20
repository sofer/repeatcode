class CourseVoices < ActiveRecord::Migration
  def self.up
    add_column :courses, :response_voice, :string
    add_column :courses, :phrase_voice, :string
  end

  def self.down
    remove_column :courses, :phrase_voice
    remove_column :courses, :response_voice
  end
end
