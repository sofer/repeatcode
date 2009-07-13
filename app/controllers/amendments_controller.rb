class AmendmentsController < ApplicationController

  before_filter :authorize

  def index
    @subject = Subject.find(params[:subject_id])
    @amendments = @subject.amendments

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @topics }
    end
  end

end
