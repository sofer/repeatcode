class UpdateArchivedCols < ActiveRecord::Migration
  def self.up
    Course.update_all(:archived => false)
    Subject.update_all(:archived => false)
  end

  def self.down
  end
end
