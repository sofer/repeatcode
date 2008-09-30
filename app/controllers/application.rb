# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include AuthenticatedSystem

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


end
