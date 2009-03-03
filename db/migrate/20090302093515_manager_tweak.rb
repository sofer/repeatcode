class ManagerTweak < ActiveRecord::Migration
  def self.up
    drop_table :managers
    rename_table :managements, :managers
  end

  def self.down
    rename_table :managers, :managements
    create_table :managers do |t|
      t.timestamps
    end
  end
end
