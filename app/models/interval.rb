class Interval < ActiveRecord::Base
  belongs_to :course

  # actual = actual failure rate (= 100 * (incorrect)/(correct+incorrect)
  # target = target failure rate (= 100 - course.target)
  # t1 = current period
  # t2 = new period
  # t2 = t1 * (target+actual)/(2*actual) where actual > target
  # t2 = t1 * (3*target-actual)/(2*target) where actual < target
  def reset
    correct = course.responses.correct.interval(self.index_no).since(self.updated_at).count
    incorrect = course.responses.incorrect.interval(self.index_no).since(self.updated_at).count
    
    return false if self.index_no < 2
    
    actual = 100.0 * (incorrect) / (correct + incorrect)
    target = 100.0 - course.accuracy_target
    
    case
    when actual > target
      update_attribute :minutes, ( self.minutes * (target+actual)/(2*actual) ).to_i
    when actual < target
      update_attribute :minutes, ( self.minutes * (3*target-actual)/(2*target) ).to_i
    else
      return false
    end
  end
  
end
