class TweakSubject < ActiveRecord::Migration
  def self.up
    add_column :subjects, :phrase_speech, :string
    add_column :subjects, :response_speech, :string
    add_column :courses, :lesson_target, :integer
  end

  def self.down
    remove_column :subjects, :phrase_speech
    remove_column :subjects, :response_speech
    remove_column :courses, :lesson_target
  end
end
