class AreaTweak < ActiveRecord::Migration
  def self.up
    rename_column :subjects, :area, :area_id
    
    say_with_time "adding new areas..." do
      exam = Area.find(:first, :conditions => "name='Exams'")
      exam.update_attribute :name, 'GCSEs'
      Area.create :name => "A-levels"
    end
    
  end

  def self.down
    rename_column :subjects, :area_id, :area
  end
end
