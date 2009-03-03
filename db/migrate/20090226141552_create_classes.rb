class CreateClasses < ActiveRecord::Migration
  def self.up
    create_table :classes do |t|
      t.string :name
      t.integer :organization_id

      t.timestamps
    end
  end

  def self.down
    drop_table :classes
  end
end
