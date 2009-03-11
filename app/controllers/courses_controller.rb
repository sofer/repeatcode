class CoursesController < ApplicationController

  before_filter :authorize

  # GET /courses
  # GET /courses.xml
  def index
    if params[:archived]
      @action = 'Unarchive'
      @courses = current_user.courses.inactive.paginate(
                :per_page => 14, 
                :page => params[:page]
                )
    else
      @action = 'Archive'
      @courses = current_user.courses.active.paginate(
                :per_page => 14, 
                :page => params[:page]
                )
    end
    
    # check the queue of pending questions
    if params[:version] and params[:version]=='clear' 
      message = @courses.first.clear_all
      flash[:notice] = message
    end

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @courses }
    end
  end

  # GET /courses/1
  # GET /courses/1.xml
  def show
    @course = Course.find(params[:id])
    @lessons =  @course.lessons.paginate(
                  :per_page => 15, 
                  :page => params[:page], 
                  :order => "id DESC",
                  :conditions => "updated_at > created_at"
                )

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @course }
    end
  end

  # GET /courses/1/edit
  def edit
    @course = Course.find(params[:id])
    @topics = @course.subject.topics.paginate(
              :per_page => 15, 
              :page => params[:page]
              )
  end

  # GET /courses/new
  # GET /courses/new.xml
  def new
    @course = Course.new
    @subjects = Subject.all
    @areas = Area.find(:all)

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @course }
    end
  end

  # POST /courses
  # POST /courses.xml
  def create
    @subject = Subject.find(params[:subject_id])
    @course = @subject.courses.new(params[:course])

    respond_to do |format|
      if @course.save
        current_user.courses << @course
        flash[:notice] = 'Course was successfully created.'
        format.html { redirect_to(courses_path) }
        format.xml  { render :xml => @course, :status => :created, :location => @course }
      else
        flash[:error] = 'Problem encountered.'
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @course.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /courses/1
  # PUT /courses/1.xml
  # Updates NOT JUST USED for un/archiving. NEED TO CHANGE THIS
  def update
    @course = Course.find(params[:id])
    
    respond_to do |format|
      if @course.update_attributes(params[:course])
        flash[:notice] = 'Course was successfully updated.'
        format.html { redirect_to(:back) }
        format.xml  { head :ok }
      else
        flash[:notice] = 'Course was NOT updated.'
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @course.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /courses/1
  # DELETE /courses/1.xml
  def destroy
    @course = Course.find(params[:id])
    @course.destroy

    respond_to do |format|
      format.html { redirect_to(:back) }
      format.xml  { head :ok }
    end
  end
  
end
