class Manager < ActiveRecord::Base
  belongs_to :organization
  belongs_to :user
  #has_many :tutors, :through => management, :source => :user_id

  validates_uniqueness_of   :user_id

end
