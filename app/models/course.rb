class Course < ActiveRecord::Base

  belongs_to :subject
  has_many :lessons
  has_many :subscriptions
  has_one :user, :through => :subscriptions # 2009-05-18: Changed to has_one
  has_many :intervals, :order => :index_no
  has_many :questions, :order => :current_interval
  has_many :responses, :through => :questions
  has_many :course_topics
  
  named_scope :active, :conditions => { :archived => false }
  named_scope :inactive, :conditions => { :archived => true }

  before_validation_on_create :copy_subject_details, :set_status_and_targets
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
  
  def update_required?
    if subject.exercises.updated_since(self.synched_at).empty? and subject.updated_at < self.updated_at
      return false
    else
      return true
    end
  end
  
  def copy_subject_details
    self.name = subject.name
    self.extended_chars = subject.extended_chars
  end
  
  def update_topics
    result_string = ''
    updated_count = created_count = 0
    updated_topics = subject.topics.updated_since(self.synched_at)
    if updated_topics
      for topic in updated_topics
        course_topic = course_topics.first( :conditions => { :topic_id => topic.id } )
        if course_topic
          updated_count += 1
        else
          created_count += 1
          course_topic = CourseTopic.new({ :course_id => self.id })
        end
        course_topic.update_from_topic(topic.id)
      end
    end
    result_string += "1 new topic created. " if created_count == 1
    result_string + "#{created_count} new topics created. " if created_count > 1
    result_string + "1 topic updated. " if updated_count == 1
    result_string + "#{updated_count} topics updated. " if updated_count > 1
    return result_string
  end

  def update_exercises
    result_string = ''
    updated_count = created_count = 0
    updated_exercises = subject.exercises.updated_since(self.synched_at)
    if updated_exercises
      for exercise in updated_exercises
        question = questions.first( :conditions => { :exercise_id => exercise.id } )
        if question
          updated_count += 1
        else
          created_count += 1
          course_topic = course_topics.first( :conditions => { :topic_id => exercise.topic_id } )
          question = Question.new({ :course_id => self.id, :course_topic_id => course_topic.id})
        end
        question.update_from_exercise(exercise.id)
      end
    end
    begin
      self.update_attributes!({ :synched_at => Time.now })
    rescue RecordInvalid => error
        logger.error invalid.record.errors
    end
    result_string +=  "1 new exercise created. " if created_count == 1
    result_string += "#{created_count} new exercises created. " if created_count > 1
    result_string += "1 exercise updated. " if updated_count == 1
    result_string += "#{updated_count} exercises updated. " if updated_count > 1
    if result_string.empty?
      return "No updates to course exercises required."
    else
      return result_string
    end
  end
  
  def subject_update
    copy_subject_details
    result_string = update_topics
    result_string += update_exercises
    return result_string
  end
    
  def next_question(exclude_question=0)
    question = questions.current.find(  
                :first,
                :conditions => ['next_datetime <= ? and id != ?', Time.now, exclude_question], 
                :order => 'current_interval'
              )
    unless question
      question = questions.not_yet_queued.first
      question.initial_state if question
    end
    return question
  end
  
  def set_intervals
    DEFAULT_INTERVALS.each do |index, mins|
      new_interval = intervals.new( :index_no => index, :minutes => mins)
      new_interval.save
    end
  end
  
private

  def copy_course_material
    subject.topics.current.each do |topic|
      course_topic = CourseTopic.new({ :course_id => self.id })
      course_topic.update_from_topic(topic.id)
      topic.exercises.current.each do |exercise|
        question = Question.new({ :course_id => self.id, :course_topic_id => course_topic.id})
        question.update_from_exercise(exercise.id)
      end
    end
  end
  
  def set_status_and_targets
    self.archived = false
    self.accuracy_target = DEFAULT_TARGETS['ACCURACY']
    self.lesson_target = DEFAULT_TARGETS['LESSON']
    self.weekly_target = DEFAULT_TARGETS['WEEKLY']
  end

end
