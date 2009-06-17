class ResponsesController < ApplicationController

  before_filter :authorize

  # POST /responses
  # POST /responses.xml
  def create
    @question = Question.find(params[:question_id])
    @response = @question.responses.new(params[:response])

    respond_to do |format|
      if @response.save
        format.xml  { head :ok }
        format.json { head :ok }
      else
        format.xml  { render :xml => @response.errors, :status => :unprocessable_entity }
        format.json { render :json => @response.errors }
      end
    end
  end

end
