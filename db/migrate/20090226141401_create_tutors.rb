class CreateTutors < ActiveRecord::Migration
  def self.up
    create_table :tutors do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :tutors
  end
end
