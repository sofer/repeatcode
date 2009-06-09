class CourseTopic < ActiveRecord::Base

  belongs_to :course
  belongs_to :topic
  has_many :questions

  named_scope :current, :conditions => { :removed => false }

  validates_presence_of :name
  validates_presence_of :course_id
  validates_presence_of :topic_id

end
