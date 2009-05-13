class RtlOnTopic < ActiveRecord::Migration
  def self.up
    add_column :topics, :rtl, :boolean, :default => false
  end

  def self.down
    remove_column :topics, :rtl
  end
end
