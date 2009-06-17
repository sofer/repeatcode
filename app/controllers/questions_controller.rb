class QuestionsController < ApplicationController
  
  before_filter :authorize, :except => :update
  
  # GET /questions
  # GET /questions.xml
  def index
    @course = Course.find(params[:course_id])
    @questions =  @course.questions.due.all(:limit=>100) + @course.questions.pending.all(:limit=>100)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @questions }
    end
  end

  # GET /questions/1
  # GET /questions/1.xml
  def show
    @question = Question.find(params[:id])
    @course = @question.course

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @question }
    end
  end

  # PUT /questions/1
  # PUT /questions/1.xml
  def update
    @question = Question.find(params[:id])

    respond_to do |format|
      if @question.update_attributes(params[:question])
        format.json { render :json => 'Question updated OK' }
        format.xml  { head :ok }
      else
        format.json { render :json => @question.errors }
        format.xml  { render :xml => @question.errors, :status => :unprocessable_entity }
      end
    end
  end

end
