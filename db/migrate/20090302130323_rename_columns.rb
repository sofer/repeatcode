class RenameColumns < ActiveRecord::Migration
  def self.up
    rename_column :enrolments, :class_id, :group_id
    rename_column :tuitions, :class_id, :group_id
  end

  def self.down
    rename_column :enrolments, :group_id, :class_id 
    rename_column :tuitions, :group_id, :class_id 
  end
end
