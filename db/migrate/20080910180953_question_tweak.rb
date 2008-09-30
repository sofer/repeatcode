class QuestionTweak < ActiveRecord::Migration
  def self.up
    add_column :topics, :code, :text
    add_column :topics, :data, :text
    add_column :exercises, :hint, :string
    add_column :exercises, :insert, :string
  end

  def self.down
    remove_column :exercises, :insert
    remove_column :exercises, :hint
    remove_column :topics, :data
    remove_column :topics, :code
  end
end
