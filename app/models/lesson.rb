class Lesson < ActiveRecord::Base

  belongs_to :course
  
named_scope :started,  :conditions => "correct_responses > 0" 
named_scope :recent, lambda { |days|
    days_ago = Time.now - (days * 24 - 1) * 3600 # 'days' ago - 1 hour
   { :conditions => [ 'created_at > ?', days_ago ] } 
  }
  
  before_create :set_progress

  def days_ago(days)
    day = 60 * 60 * 24
    now = Time.now
    return now - days * day
  end

  # set default value of 0
  def correct_responses
    self[:correct_responses] or 0
  end

  def elapsed_time
    ((Time.now - self.created_at) / 60).to_i
  end

  def increment_correct
    # change to update_attribute?
    self.correct_responses += 1
    save!
  end
  
  def backlog
    self.course.questions.current.count( :conditions => ['next_datetime <= ?', Time.now])
  end
  
private

  def set_progress
    self.total_questions_started = course.questions.started.count
  end
  
end
