class Uid < ActiveRecord::Migration

  def self.generate_uid
    chars = ('a'..'z').to_a + ('A'..'Z').to_a + ('0'..'9').to_a
    id = ''
    1.upto(8) {
      i = rand(62)
      id += chars[i]
    }
    return id  
  end

  def self.up
    add_column :users, :uid, :string
  
    say_with_time "adding uids..." do
      users = User.find(:all)
      users.each do |user|
        id = generate_uid
        user.update_attribute :uid, id
      end
    end
  
  
  end

  def self.down
    remove_column :users, :uid
  end
end
