class TweakTopic < ActiveRecord::Migration
  def self.up
    add_column :topics, :add_together, :boolean
  end

  def self.down
    remove_column :topics, :add_together
  end
end
