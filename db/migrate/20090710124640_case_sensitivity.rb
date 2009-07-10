class CaseSensitivity < ActiveRecord::Migration
  def self.up
		add_column :subjects, :case_sensitive, :boolean, :default => false
		add_column :topics, :case_sensitive, :boolean, :default => false
		add_column :course_topics, :case_sensitive, :boolean, :default => false
  end

  def self.down
	remove_column :subjects, :case_sensitive
	remove_column :topics, :case_sensitive
	remove_column :course_topics, :case_sensitive
  end
end
