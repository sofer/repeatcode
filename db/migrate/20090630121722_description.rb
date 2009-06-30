class Description < ActiveRecord::Migration
  def self.up
    add_column :subjects, :description, :text
    add_column :courses, :description, :text
  end

  def self.down
    remove_column :subjects, :description
    removr_column :courses, :description
  end
end
