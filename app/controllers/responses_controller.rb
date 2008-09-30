class ResponsesController < ApplicationController
  # GET /responses
  # GET /responses.xml
  def index
    @responses = Response.paginate(
                  :per_page => 10, 
                  :page => params[:page], 
                  :order => "id DESC"
                  )

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @responses }
    end
  end

  # GET /responses/1
  # GET /responses/1.xml
  def show
    @response = Response.find(params[:id])
    @question = @response.question

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @question }
    end
  end

  # POST /responses
  # POST /responses.xml
  def create
    @question = Question.find(params[:question_id])
    @response = @question.responses.new(params[:response])

    respond_to do |format|
      if @response.save
        if @response.result==Response::RESULTS['pending']
          format.html { redirect_to @response }
          format.xml  { render :xml => @response, :status => :created, :location => @response }
        else
          format.html { redirect_to(@response.question.course.current_lesson) }
          format.xml  { head :ok }
        end
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @response.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /responses/1
  # PUT /responses/1.xml
  def update
    @response = Response.find(params[:id])

    respond_to do |format|
      if @response.update_attributes(params[:response])
        format.html { redirect_to(@response.question.course.current_lesson) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @response.errors, :status => :unprocessable_entity }
      end
    end
  end

end
