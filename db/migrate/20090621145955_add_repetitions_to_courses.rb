class AddRepetitionsToCourses < ActiveRecord::Migration
  def self.up
    add_column :courses, :repetitions, :integer, :default => 9
  end

  def self.down
    remove_column :courses, :repetitions
  end
end
