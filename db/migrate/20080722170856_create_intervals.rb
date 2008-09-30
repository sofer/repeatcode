class CreateIntervals < ActiveRecord::Migration
  def self.up
    create_table :intervals do |t|
      t.integer :course_id
      t.integer :index_no
      t.integer :minutes

      t.timestamps
    end
  end

  def self.down
    drop_table :intervals
  end
end
