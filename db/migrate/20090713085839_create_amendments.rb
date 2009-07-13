class CreateAmendments < ActiveRecord::Migration
  def self.up
    create_table :amendments do |t|
      t.integer :exercise_id
      t.integer :subject_id
      t.integer :user_id
      t.string :kind
      t.string :text
      t.string :comments

      t.timestamps
    end

    create_table :votes do |t|
      t.integer :amendment_id
      t.integer :user_id

      t.timestamps
    end

  end

  def self.down
    drop_table :amendments
    drop_table :votes
  end
end
