require 'digest/sha1'

class User < ActiveRecord::Base

  has_many :subscriptions
  has_many :courses, :through => :subscriptions #, :uniq => true
  has_many :authorships
  has_many :subjects, :through => :authorships
  belongs_to :organization
  has_many :enrolments
  has_many :groups, :through => :enrolments
  has_many :tuitions # should be 'tutelages'
  has_many :tutor_groups, :through => :tuitions, :source => :group
  has_one :manager # slightly odd nomenclature here.
  has_one :administrator # and here. It could have been a boolean field instead of a foreign key

  include Authentication
  include Authentication::ByCookieToken
  #include Authentication::ByPassword

  before_create :assign_uid

  # REMOVED THESE FOR NOW BECAUSE OF AUTO REGISTRATION - 2009-04-28
  #validates_presence_of     :organization_id
  #validates_presence_of     :login
  #validates_length_of       :login,    :within => 3..40
  #validates_uniqueness_of   :login,    :case_sensitive => false
  ##validates_format_of       :login,    :with => RE_LOGIN_OK, :message => MSG_LOGIN_BAD
  #validates_format_of       :login,    :with => Authentication.login_regex, :message => Authentication.bad_login_message
  ##validates_format_of       :name,     :with => RE_NAME_OK,  :message => MSG_NAME_BAD, :allow_nil => true
  #validates_format_of       :name,     :with => Authentication.name_regex, :message => Authentication.bad_name_message, :allow_nil => true
  #validates_length_of       :name,     :maximum => 100

  # DS: made email voluntary for now
  #validates_presence_of     :email
  #validates_length_of       :email,    :within => 6..100 #r@a.wk
  #validates_uniqueness_of   :email,    :case_sensitive => false
  ##validates_format_of       :email,    :with => RE_EMAIL_OK, :message => MSG_EMAIL_BAD
  #validates_format_of       :email,    :with => Authentication.email_regex, :message => Authentication.bad_email_message

  # HACK HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  # Note added 1/5/09: OK. Just spotted this. And added :voice
  attr_accessible :login, :email, :name, :password, :password_confirmation, :voice



  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.  
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #
  def self.authenticate(login, password)
    u = find_by_login(login) # need to get the salt
    u && u.authenticated?(password) ? u : nil
  end
  
private

  # a unique 8-digit id for new accounts
  def assign_uid
    chars = ('a'..'z').to_a + ('A'..'Z').to_a + ('0'..'9').to_a
    uid = ''
    1.upto(8) {
      i = rand(62)
      uid += chars[i]
    }
    self.uid = uid
  end
  
end
