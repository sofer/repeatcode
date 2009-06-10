class QuestionAmended < ActiveRecord::Migration
  def self.up
    rename_column :questions, :removed, :amended
  end

  def self.down
    rename_column :questions, :amended, :removed
  end
end
