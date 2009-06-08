class Removed < ActiveRecord::Migration
  def self.up
    add_column :topics, :removed, :boolean, :default => false
    add_column :course_topics, :removed, :boolean, :default => false
    add_column :questions, :removed, :boolean, :default => false
  end

  def self.down
    remove_column :topics, :removed
    remove_column :course_topics, :removed
    remove_column :questions, :removed
  end
end
