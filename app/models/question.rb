class Question < ActiveRecord::Base

  belongs_to :course
  belongs_to :exercise
  has_many :responses, :dependent => :destroy

  before_create :set_datetime

=begin - probably not needed if these get set before_create
  def current_interval
    self[:current_interval] or 0
  end

  def next_datetime
    self[:next_datetime] or Time.now
  end
=end

  def set_interval
    self.current_interval = 0 unless self.current_interval
  end
  
  def reset_interval
    self.current_interval = ""
    reset_time
  end
  
  def reset_time
    self.next_datetime = Time.now
  end
  
  def next_interval
    self.current_interval += 1 unless self.current_interval == Course::MAX_INDEX
    interval_index = self.current_interval
    repeat_interval = course.intervals.find(:first, :conditions => {:index_no => interval_index}).minutes
    self.next_datetime = Time.now + repeat_interval * 60
  end

private

  def set_datetime
#    self.current_interval = 0
    self.next_datetime = Time.now
  end
    
end
