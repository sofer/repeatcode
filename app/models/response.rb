class Response < ActiveRecord::Base
  
  belongs_to :question
  
  before_save :check
  
  RESULTS = {
    'none' => 'none',
    'correct' => 'correct',
    'pending' => 'pending',
    'incorrect' => 'incorrect',
    'ignore' => 'ignore'
  }
  
  def result
    self[:result] or RESULTS['none']
  end
  
  def check
    self.interval = question.current_interval
    case self.result
    when RESULTS['none']
      expected_response = simplify(question.exercise.response)
      pattern = /#{expected_response}/
      this_response = simplify(self.content)
      if pattern =~ this_response
        self.result = RESULTS['correct']
        question.next_interval
        self.question.course.current_lesson.increment_correct
      else
        self.result = RESULTS['pending']
      end
    when RESULTS['incorrect']
      question.reset_interval
    when RESULTS['ignore']
      question.reset_time
    end
    question.save!
  end
  
private

  def simplify(phrase)
    phrase.gsub(/[\s,.!?]/, '').downcase
  end
  
end
