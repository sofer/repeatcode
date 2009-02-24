class CreateOrganizations < ActiveRecord::Migration
  def self.up
    create_table :organizations do |t|
      t.string :name
      t.integer :default_target
      t.integer :default_lesson_target
      t.integer :super_id
      t.timestamps
    end
  end

  def self.down
    drop_table :organizations
  end
end
