class CreateTopics < ActiveRecord::Migration
  def self.up
    create_table :topics do |t|
      t.integer :subject_id
      t.string :name
      t.integer :position

      t.timestamps
    end
  end

  def self.down
    drop_table :topics
  end
end
