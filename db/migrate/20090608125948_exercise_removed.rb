class ExerciseRemoved < ActiveRecord::Migration
  def self.up
    add_column :exercises, :removed, :boolean, :default => false
  end

  def self.down
    remove_column :exercises, :removed
  end
end
