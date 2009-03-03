class CreateEnrolments < ActiveRecord::Migration
  def self.up
    create_table :enrolments do |t|
      t.integer :user_id
      t.integer :class_id

      t.timestamps
    end
  end

  def self.down
    drop_table :enrolments
  end
end
