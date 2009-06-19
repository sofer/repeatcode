class Question < ActiveRecord::Base

  belongs_to :course
  belongs_to :exercise
  belongs_to :course_topic
  
  has_many :responses, :dependent => :destroy

  named_scope :queued, :conditions => "current_interval IS NOT NULL"
  named_scope :started, :conditions => "current_interval > 0"
  named_scope :not_yet_queued, :conditions => "current_interval IS NULL"
  named_scope :current, :conditions => { :ignore => false }
  named_scope :ignored, :conditions => { :ignore => true }
  named_scope :amended, :conditions => { :amended => true }
  named_scope :due, :conditions => [ 'next_datetime < ?', Time.now ]
  named_scope :pending, :conditions => [ 'next_datetime > ?', Time.now ]

  validates_presence_of :course_id
  validates_presence_of :exercise_id
  validates_presence_of :course_topic_id

  def update_from_exercise(exercise_id)
    exercise = Exercise.find(exercise_id)
    begin
      self.update_attributes!({ :exercise_id => exercise.id,
                                :phrase => exercise.phrase,
                                :response => exercise.response,
                                :pattern => exercise.pattern,
                                :notes => exercise.notes,
                                :hint => exercise.hint,
                                :insert => exercise.insert,
                                :ignore => false })
    rescue RecordInvalid => error
        logger.error invalid.record.errors
    end
  end

  def reset_interval_and_datetime(interval)
    self.current_interval = interval + 1 unless interval == Course::MAX_INDEX
    minutes_to_go = course.intervals.find(:first, :conditions => {:index_no => self.current_interval}).minutes
    minutes_to_go += rand(minutes_to_go/10) if minutes_to_go > 10
    self.next_datetime = Time.now + minutes_to_go * 60
  end

  def initial_state
    self.update_attributes( {:next_datetime => Time.now, :current_interval => 0 })
  end
  
end
