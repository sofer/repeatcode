class Question < ActiveRecord::Base

  belongs_to :course
  belongs_to :exercise
  has_many :responses, :dependent => :destroy

  before_create :first_interval
  
  def reset_interval_and_datetime(interval)
    self.current_interval = interval + 1 unless interval == Course::MAX_INDEX
    minutes_to_go = course.intervals.find(:first, :conditions => {:index_no => self.current_interval}).minutes
    minutes_to_go += rand(minutes_to_go/10) if minutes_to_go > 10
    self.next_datetime = Time.now + minutes_to_go * 60
  end

  def first_interval
    self.current_interval = 0
    self.next_datetime = Time.now
  end

end
