class LastIp < ActiveRecord::Migration
  def self.up
    add_column :users, :last_login, :string
  end

  def self.down
    remove_column :users, :last_login
  end
end
