class Question < ActiveRecord::Base

  belongs_to :course
  belongs_to :exercise
  has_many :responses, :dependent => :destroy

  before_create :set_interval_and_datetime

  def reset_interval_and_datetime(interval)
    self.current_interval = interval + 1 unless interval == Course::MAX_INDEX
    minutes_to_go = course.intervals.find(:first, :conditions => {:index_no => self.current_interval}).minutes
    self.next_datetime = Time.now + minutes_to_go * 60
  end

private

  def set_interval_and_datetime
    reset_interval_and_datetime(-1)
  end
    
end
