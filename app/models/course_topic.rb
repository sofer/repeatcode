class CourseTopic < ActiveRecord::Base
  belongs_to :course
  has_many :questions

  named_scope :current, :conditions => { :removed => false }

end
