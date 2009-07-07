# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include AuthenticatedSystem
  before_filter :sanitize_params

  helper :all # include all helpers, all the time

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  protect_from_forgery # :secret => '53984dd80a774432534fa8b930d93ba1'

private

  def authorize 
    unless logged_in?
      session[:original_uri] = request.request_uri
      flash[:notice] = "Please log in" 
      redirect_to("/login") 
    end 
  end 

  def admin_authorize 
    unless logged_in? && current_user.administrator
      session[:original_uri] = request.request_uri
      flash[:notice] = "Please log in" 
      redirect_to("/login") 
    end 
  end 

  def manager_authorize 
    unless logged_in? && current_user.manager
      session[:original_uri] = request.request_uri
      flash[:notice] = "Please log in" 
      redirect_to("/login") 
    end 
  end 

  def admin_manager_authorize 
    unless logged_in? && (current_user.manager || current_user.administrator)
      session[:original_uri] = request.request_uri
      flash[:notice] = "Please log in" 
      redirect_to("/login") 
    end 
  end 

  def admin_manager_tutor_authorize 
    unless logged_in? && (current_user.tutor_groups || current_user.manager || current_user.administrator)
      session[:original_uri] = request.request_uri
      flash[:notice] = "Please log in" 
      redirect_to("/login") 
    end 
  end 


end
