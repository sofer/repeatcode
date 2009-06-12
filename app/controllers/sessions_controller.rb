# This controller handles the login/logout function of the site.  
class SessionsController < ApplicationController
  
  # Be sure to include AuthenticationSystem in Application Controller instead
  #include AuthenticatedSystem

  
  # render new.rhtml
  def new
    respond_to do |format|
      format.html # new.html.erb
    end    
  end

  def create
    if params[:uid] # and params[:uid] != ''
      uid = params[:uid].strip
      user = User.find_by_uid(uid)
      if not user
        note_failed_uid_signin
        @uid       = uid
        @remember_me = params[:remember_me]
        render :action => 'new'
      end
    else
      logout_keeping_session!
      user = User.authenticate(params[:login], params[:password])
      if not user
        note_failed_signin
        @login       = params[:login]
        @remember_me = params[:remember_me]
        render :action => 'new'
      end
    end
    if user
      user.last_login = request.remote_ip
      user.save!
      self.current_user = user
      new_cookie_flag = (params[:remember_me] == "1")
      handle_remember_cookie! new_cookie_flag
      redirect_back_or_default('/courses')
      flash[:notice] = "Logged in successfully"
    end
  end
    

  def destroy
    logout_killing_session!
    flash[:notice] = "You have been logged out."
    redirect_back_or_default('/')
  end

protected

  def note_failed_uid_signin
    flash[:error] = "Couldn't log you in as '#{params[:uid]}'"
    logger.warn "Failed login for '#{params[:uid]}' from #{request.remote_ip} at #{Time.now.utc}"
  end

  def note_failed_signin
    flash[:error] = "Couldn't log you in as '#{params[:login]}'"
    logger.warn "Failed login for '#{params[:login]}' from #{request.remote_ip} at #{Time.now.utc}"
  end

end
