class Course < ActiveRecord::Base
  belongs_to :subject
  has_many :lessons
  has_many :subscriptions
  has_many :users, :through => :subscriptions
  has_many :intervals
  has_many :questions
  
  named_scope :active, :conditions => { :archived => false }
  named_scope :inactive, :conditions => { :archived => true }

  before_validation_on_create :set_status_and_targets
  after_create :set_intervals
  
  validates_numericality_of :accuracy_target
  validates_numericality_of :lesson_target
  validates_numericality_of :weekly_target
  validates_inclusion_of :accuracy_target, :in => 0..100, :message => "must between 0 and 100"

  DEFAULT_TARGETS = { 
    'ACCURACY'  => 90, # accuracy rate of responses
    'LESSON' => 50, # number of correct responses per lesson
    'WEEKLY'    => 5   # number of lessons per week
  }

  MAX_INDEX = 8

  DAY = 60 * 24
  
  DEFAULT_INTERVALS = {
    0 => 0,
    1 => 1,
    2 => 5,
    3 => DAY / 2,
    4 => DAY * 6,
    5 => DAY * 15,
    6 => DAY * 35,
    7 => DAY * 85,
    8 => DAY * 224
  }
  
  def backlog_count
    questions.count(:conditions => ['next_datetime < ? AND current_interval > 0', Time.now])
  end
  
  def on_target?(days=1)
    if self.lesson_target and self.weekly_target
      recent_lessons = lessons.recent(days)
      recent_responses = response_count(recent_lessons)
      target = days * self.lesson_target * self.weekly_target / 7
      if recent_responses > target
        return true
      end
    end
    return false
  end
  
  def end_date
    if self.lesson_target and self.weekly_target
      correct_so_far = 0
      self.questions.each { |q| correct_so_far += q.responses.correct.count }
      total_needed = self.subject.exercises.count * (DEFAULT_INTERVALS.size - 1)
      total_to_go = total_needed - correct_so_far
      target_daily_rate = self.lesson_target * self.weekly_target / 7
      target_daily_rate = 1 if target_daily_rate == 0
      days_to_go = total_to_go / target_daily_rate
      return Time.now + days_to_go * 24 * 60 * 60 
    end
  end
  
  def responses_on_completion
    return self.subject.exercises.count * (DEFAULT_INTERVALS.size - 1)
  end

  def xall_time_responses
    so_far = response_count(lessons)
    total = self.subject.exercises.count * DEFAULT_INTERVALS.size
    return so_far if total == 0
    percent = 100 * so_far / total
    return "#{so_far} (#{percent}%)"
  end
  
  def progress_for_period(days)
    recent_lessons = lessons.recent(days)
    count = response_count(recent_lessons)
    result = ['0','']
    return result if count == 0
    result[0] = "#{count}"
    if self.lesson_target and self.weekly_target
      if days == 1
        percent = 100 * count / self.lesson_target
      else
        daily_target = self.lesson_target * self.weekly_target / 7
        percent = 100 * count / (daily_target * days)
      end
      result[0] += " (#{percent}%)"      
      result[1] = 'ON TARGET' if percent >= 100
    end
    return result
  end

  def responses_in_last_days(days)
    recent_lessons = lessons.recent(days)
    return response_count(recent_lessons)
  end

  def target_for_last_days(days)
    if self.lesson_target and self.weekly_target
      daily_target = self.lesson_target * self.weekly_target / 7
      return daily_target * days
    end
  end
  
  def response_report(days_arr)
    results = []
    days_arr.each do |days|
      target = percent = status = ''
      recent_lessons = lessons.recent(days)
      responses = response_count(recent_lessons)
      if self.lesson_target and self.weekly_target
        daily_target = self.lesson_target * self.weekly_target / 7
        target = daily_target * days
        percent = 100 * responses / target
        status = 'ON TARGET' if percent >= 100
      end
      results << { 'days' => days, 'responses' => responses, 'target' => target, 'percent' => percent, 'status' => status }
    end
    return results
  end
  
  def response_count(recent_lessons)
    count = 0
    for lesson in recent_lessons
      count += lesson.correct_responses
    end
    return count
  end

  def response_count_check
    count = 0
    for question in questions
      count += question.responses.correct.count 
    end
    return count
  end
  
  def last_question
    @last_question ||= self[:last_question] ? Question.find(self[:last_question]) : false
  end
  
  def clear_all
    questions = Question.find(:all)
    count = 0
    for question in questions
      if not question.exercise or not question.exercise.topic
        if question.exercise
          question.exercise.destroy
        end
        question.destroy
        count += 1
      end
    end
    return count
  end
  
  # Add any exercises added since the last question, if they are from topics already covered
  def add_new_material
    question_count = 0
    if last_question
      if subject.exercises.last.created_at > last_question.created_at
        new_exercises = subject.exercises.since(last_question.created_at)
        for exercise in new_exercises
          if exercise.topic.position < last_question.exercise.topic.position ||
            exercise.topic.position == last_question.exercise.topic.position &&
            exercise.position < last_question.exercise.position
            add_question(exercise)
            question_count += 1
          end
        end
      end
    end
    return question_count
  end
  
  def accuracy_target
    self[:accuracy_target] or DEFAULT_TARGETS['ACCURACY']
  end
  def lesson_target
    self[:lesson_target] or DEFAULT_TARGETS['LESSON']
  end
  def weekly_target
    self[:weekly_target] or DEFAULT_TARGETS['WEEKLY']
  end # END REMOVE

  def current_lesson
    self.lessons.last
  end
  
  def responses
    results = {}
    for interval in self.intervals
      results[interval.index_no] = { :correct => 0, :incorrect => 0, :last_reset => interval.last_reset_date }
    end
    for question in self.questions
      for response in question.responses.find(:all)
        if response.updated_at > results[response.interval][:last_reset]
          if response.result == Response::RESULTS[:correct]
            results[response.interval][:correct] += 1
          elsif response.result == Response::RESULTS[:incorrect]
            results[response.interval][:incorrect] += 1
          end
        end
      end
    end
    return results
  end
  
  def next_question
    if questions.empty?
      # get first question
      if self.subject.topics.first
        return new_topic(self.subject.topics.first)
      end
    else
      # get next exercise within the current topic
      next_exercise = self.last_question.exercise.lower_item
      if next_exercise
        return add_question(next_exercise)
      else
        # get next topic
        next_topic = self.last_question.exercise.topic.lower_item
        if next_topic
          return new_topic(next_topic)
        end
      end
    end
  end
  
  def add_question(exercise)
    next_question = Question.new(:exercise_id => exercise.id)
    self.questions << next_question
    self.update_attribute :last_question, next_question.id
    return next_question
  end

  def new_topic(topic)
    next_exercise = topic.exercises.first
    if next_exercise
      next_question = add_question(next_exercise)
      if topic.add_together
        next_exercise = next_exercise.lower_item
        while next_exercise
          add_question(next_exercise)
          next_exercise = next_exercise.lower_item
        end
      end
      return next_question
    end
  end

private

  def set_intervals
    DEFAULT_INTERVALS.each do |index, mins|
      new_interval = intervals.new( :index_no => index, :minutes => mins)
      new_interval.save
    end
  end
  
  def set_status_and_targets
    self.archived = false
    self.accuracy_target = DEFAULT_TARGETS['ACCURACY']
    self.lesson_target = DEFAULT_TARGETS['LESSON']
    self.weekly_target = DEFAULT_TARGETS['WEEKLY']
  end

end
