class Response < ActiveRecord::Base
  
  belongs_to :question
  named_scope :correct, :conditions => {:result => 'correct' }
  named_scope :incorrect, :conditions => {:result => 'incorrect' }
  
  before_create :reset_question
  
  RESULTS = {
    :correct => 'correct',
    :incorrect => 'incorrect'
  }

private

  def reset_question
    if self.result == RESULTS[:correct]
      question.course.current_lesson.increment_correct
      question.reset_interval_and_datetime(self.interval)
    else
      question.reset_interval_and_datetime(0)
    end
    begin
      question.save!
    rescue RecordInvalid => error
        logger.error invalid.record.errors
    end
  end
end
