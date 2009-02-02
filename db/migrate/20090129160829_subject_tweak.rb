class SubjectTweak < ActiveRecord::Migration
  def self.up
    add_column :subjects, :extended_chars, :string
  end

  def self.down
    remove_column :subjects, :extended_chars
  end
end
