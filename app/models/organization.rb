class Organization < ActiveRecord::Base
  has_many :users
  has_many :tutors, :through => :tuitions, :source => :user_id 
  has_many :managers
  has_many :groups
  
  validates_uniqueness_of   :name
  
  LIST_FOR_FORM = Organization.find(:all).map do |org|
    [org.name, org.id]
  end
  
end
