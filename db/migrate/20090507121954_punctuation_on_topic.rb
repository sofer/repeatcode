class PunctuationOnTopic < ActiveRecord::Migration
  def self.up
    add_column :topics, :ignore_punctuation, :boolean, :default => true
  end

  def self.down
    remove_column :topics, :ignore_punctuation
  end
end
