class Course < ActiveRecord::Base

  belongs_to :subject
  has_many :lessons
  has_many :subscriptions
  has_one :user, :through => :subscriptions # 2009-05-18: Changed to has_one
  has_many :intervals
  has_many :questions
  has_many :course_topics
  
  named_scope :active, :conditions => { :archived => false }
  named_scope :inactive, :conditions => { :archived => true }

  before_validation_on_create :set_status_and_targets, :copy_subject_details
  after_create :set_intervals, :copy_course_material
  
  validates_presence_of :name
  validates_presence_of :subject_id
  validates_numericality_of :accuracy_target
  validates_numericality_of :lesson_target
  validates_numericality_of :weekly_target
  validates_inclusion_of :accuracy_target, :in => 0..100, :message => "must between 0 and 100"

  DEFAULT_TARGETS = { 
    'ACCURACY'  => 90, # accuracy rate of responses
    'LESSON' => 50, # number of correct responses per lesson
    'WEEKLY'    => 5   # number of lessons per week
  }

  MAX_INDEX = 9

  DAY = 60 * 24
  
  DEFAULT_INTERVALS = {
    0 => 0,
    1 => 1,
    2 => 5,
    3 => 30,
    4 => DAY,
    5 => DAY * 6,
    6 => DAY * 15,
    7 => DAY * 35,
    8 => DAY * 85,
    9 => DAY * 224
  }
  
  def update_required?
    # return true
    if  not subject or 
        questions.empty? or 
        questions.last.created_at > subject.exercises.recently_updated.first.updated_at
      return false
    else
      return true
    end
  end
  
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
  
  # Destroy all questions with no exercise and all exercises with no topic
  # 2009-05-18: GET RID OF THIS
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
  
  # Add any exercises added since the last question, if they are from topics already covered
  # THIS NEEDS TO BE CHANGED
  def add_new_material
    return 0 # return 0 for now.
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
  
  def next_question(exclude_question=0)
    question = questions.find(  
                :first,
                :conditions => ['next_datetime <= ? and id != ?', Time.now, exclude_question], 
                :order => 'current_interval'
              )
    unless question
      question = questions.not_started.first
      question.initial_state if question
    end
    return question
  end
  
  # NO LONGER BEING USED?
  def add_question(exercise)
    next_question = Question.new(:exercise_id => exercise.id)
    self.questions << next_question
    self.update_attribute :last_question, next_question.id
    return next_question
  end

  # NO LONGER BEING USED?
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

  def copy_subject_details
    self.name = subject.name
    self.extended_chars = subject.extended_chars
    self.phrase_speech = subject.phrase_speech
    self.response_speech = subject.response_speech
  end
  
private

  # this will probably need to be speeded up
  
  def copy_course_material

    subject.topics.current.each do |topic|
      course_topic = CourseTopic.new
      course_topic.topic_id = topic.id
      course_topic.course_id = self.id
      course_topic.name = topic.name
      course_topic.code = topic.code
      course_topic.data = topic.data
      course_topic.ignore_punctuation = topic.ignore_punctuation
      course_topic.add_together = topic.add_together
      course_topic.rtl = topic.rtl
      
      if course_topic.save(false)  # don't do validations
        topic.exercises.current.each do |exercise|
          question = Question.new
          question.exercise_id = exercise.id
          question.course_id = self.id
          question.course_topic_id = course_topic.id
          question.phrase = exercise.phrase
          question.response = exercise.response
          question.pattern = exercise.pattern
          question.notes = exercise.notes
          question.hint = exercise.hint
          question.insert = exercise.insert
          question.ignore = false
          question.save(false) # don't do validations
        end

      end
    end
  end
  
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
