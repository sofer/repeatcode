class Unordered < ActiveRecord::Migration
  def self.up
		add_column :subjects, :unordered, :boolean, :default => false
		add_column :topics, :unordered, :boolean, :default => false
		add_column :course_topics, :unordered, :boolean, :default => false
  end

  def self.down
	remove_column :subjects, :unordered
	remove_column :topics, :unordered
	remove_column :course_topics, :unordered
  end
end
