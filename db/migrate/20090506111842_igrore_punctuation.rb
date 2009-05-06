class IgrorePunctuation < ActiveRecord::Migration
  def self.up
    add_column :subjects, :ignore_punctuation, :boolean, :default => true
  end

  def self.down
    remove_column :subjects, :ignore_punctuation
  end
end
