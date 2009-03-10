class AddExtraColToQuestion < ActiveRecord::Migration
  def self.up
    add_column :questions, :extra, :boolean 
  end

  def self.down
    remove_column :questions, :extra
  end
end
