class RenameGroups < ActiveRecord::Migration
  def self.up
    rename_table :classes, :groups
  end

  def self.down
    rename_table :groups, :classes
  end
end
