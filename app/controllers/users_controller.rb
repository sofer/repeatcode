class UsersController < ApplicationController
  # Be sure to include AuthenticationSystem in Application Controller instead
  include AuthenticatedSystem
  

  # For show users to groups
  def index
    @group =  Group.find(params[:group_id])
    @users = @group.organization.users.paginate(
              :per_page => 14, 
              :page => params[:page]
              )


  end

  def show
    @student = User.find(params[:id])
    @courses = @student.courses.paginate(
              :per_page => 14, 
              :page => params[:page]
              )
  end
 
  # render new.rhtml
  def new
    @user = User.new
    @user.organization = Organization.find(params[:organization_id]) if params[:organization_id]
    @params = params[:organization_id]
  end
  
  def create
    logout_keeping_session!
    @user = User.new(params[:user])
    @user.organization = Organization.find(params[:organization_id])
    success = @user && @user.save
    if success && @user.errors.empty?
      # Protects against session fixation attacks, causes request forgery
      # protection if visitor resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset session
      self.current_user = @user # !! now logged in
      redirect_back_or_default( new_course_path )
      flash[:notice] = "Thanks for signing up! Please choose a course from the list above."  #We're sending you an email with your activation code."
    else
      flash[:error]  = "We couldn't set up that account, sorry.  Please try again, or contact an administrator."
      render :action => "new"
    end
  end

end
