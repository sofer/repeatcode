class Question < ActiveRecord::Base

  belongs_to :course
  belongs_to :exercise
  belongs_to :course_topic
  has_many :responses, :dependent => :destroy

  named_scope :started, :conditions => "current_interval IS NOT NULL"
  named_scope :not_started, :conditions => "current_interval IS NULL"
  named_scope :current, :conditions => { :removed => false }

  validates_presence_of :name
  validates_presence_of :course_id
  validates_presence_of :exercise_id
  validates_presence_of :course_topic_id

  def reset_interval_and_datetime(interval)
    self.current_interval = interval + 1 unless interval == Course::MAX_INDEX
    minutes_to_go = course.intervals.find(:first, :conditions => {:index_no => self.current_interval}).minutes
    minutes_to_go += rand(minutes_to_go/10) if minutes_to_go > 10
    self.next_datetime = Time.now + minutes_to_go * 60
  end

  def initial_state
    self.current_interval = 0
    self.next_datetime = Time.now
    self.save
  end

end
