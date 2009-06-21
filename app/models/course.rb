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
  validates_inclusion_of :accuracy_target, :in => 80..100, :message => "must between 80 and 100"
  validates_inclusion_of :repetitions, :in => 1..9, :message => "must between 1 and 9"

  DEFAULT_TARGETS = { 
    'ACCURACY'  => 90, # accuracy rate of responses
    'LESSON' => 50, # number of correct responses per lesson
    'WEEKLY'    => 5   # number of lessons per week
  }

  MAX_INDEX = 9

  DAY = 60 * 24
  DAY_IN_SECS = DAY * 60
  
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
    if subject.exercises.updated_since(self.synched_at).empty? and subject.updated_at < self.updated_at
      return false
    else
      return true
    end
  end
  
  # this will over-ride any attempt to save the "update_required" attribute
  def update_required=(update_required)
    notice = subject_update
    
  end
  
  def response_target(days)
    response_count = responses.correct.since(Time.now - days * DAY_IN_SECS).count
    target = days * self.lesson_target * self.weekly_target / 7
    return response_count, target
  end
  
  def on_target?(days=1)
    response_count, target = response_target(days)
    return true if response_count > target
  end
  
  def progress_for_period(days)
    response_count, target = response_target(days)
    percent = 100 * response_count / target
    if response_count == 0
      return [0,''] 
    else
      on_target = percent >= 100 ? 'ON TARGET' : ''
      return [ "#{response_count} (#{percent}%)",  on_target ]
    end
  end
  
  # based on a bit of induction this is the formula I am using for the aproximate
  # number of responses required to finish a course:
  # RESPONSES = QUESTIONS * REPETITIONS * k
  # where k = 100 * SQUARE(FAIL-RATE) + 1
  # note use of instance variable @total_responses
  def set_responses_estimate
    unless @total_responses
      if responses.count == 0
        failure_rate = 1 - 1.0 * self.accuracy_target/100
      else 
        failure_rate = 1.0 * responses.incorrect.count/responses.count
      end
      k = 100 * failure_rate * failure_rate + 1
      logger.debug "#{responses.incorrect.count}, #{responses.count}.  #{questions.current.count} x #{self.repetitions} x #{k}"
      @total_responses = (questions.current.count * self.repetitions * k).to_i
      @total_responses = (@total_responses/100).to_i * 100 if @total_responses > 200
    end
  end
  
  def estimated_end_date
    set_responses_estimate
    total_responses_remaining = @total_responses - responses.count
    target_daily_rate = self.lesson_target * self.weekly_target / 7
    days_to_go = @total_responses / target_daily_rate
    return Time.now + days_to_go * 24 * 60 * 60 
  end
  
	def responses_completed
    set_responses_estimate
		return "#{responses.count} out of an estimated #{@total_responses} (#{100*responses.count/@total_responses}%)"
	end
	
  def questions_started
  	started = questions.started.count 
  	total = questions.count
		return "#{started} out of #{total} (#{100*started/total}%)"
	end
	
  def weekly_response_count
    (7 * DAY_IN_SECS * responses.count / (Time.now - self.created_at)).to_i
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
  
  def next_question(exclude_question=0)
    question = questions.current.due.find(
      :first,
      :conditions => ['id != ?', exclude_question]) ||
      questions.current.not_yet_queued.first || 
      questions.current.pending.find(
      :first,
      :conditions => ['id != ? and current_interval <= ?', exclude_question, self.repetitions])
    question.initial_state if question and not question.current_interval
    return question
  end
  
  def set_intervals
    DEFAULT_INTERVALS.each do |index, mins|
      new_interval = intervals.new( :index_no => index, :minutes => mins)
      new_interval.save
    end
  end
  
  def subject_update
    copy_subject_details
    result_string = update_topics
    result_string += update_exercises
    return result_string
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
