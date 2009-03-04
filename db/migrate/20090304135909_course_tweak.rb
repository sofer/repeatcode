class CourseTweak < ActiveRecord::Migration
  def self.up
    rename_column :courses, :target, :accuracy_target
    add_column :courses, :weekly_target, :integer
    
  end

  def self.down
    rename_column :courses, :target, :accuracy_target
    remove_column :courses, :weekly_target
  end
end
