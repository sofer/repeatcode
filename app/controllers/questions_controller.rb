class QuestionsController < ApplicationController
  
  before_filter :authorize
  
  # GET /questions
  # GET /questions.xml
  def index
    @course = Course.find(params[:course_id])
    @questions =  @course.questions.started.paginate(
                  :per_page => 15, 
                  :page => params[:page], 
                  :order => "next_datetime"
                 )

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
    @responses =  @question.responses.paginate(
                  :per_page => 15, 
                  :page => params[:page]
                 )

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @question }
    end
  end

  # PUT /questions/1
  # PUT /questions/1.xml
  def update
    @question = Question.find(params[:id])
    @question.set_interval

    respond_to do |format|
      if @question.update_attributes(params[:question])
        format.html { redirect_to(@question.course.current_lesson) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @question.errors, :status => :unprocessable_entity }
      end
    end
  end

end
