class CoursesController < ApplicationController

  before_filter :authorize

  # GET /courses
  # GET /courses.xml
  def index
    @courses = current_user.courses

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
                  :per_page => 20, 
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
  end

  # GET /courses/new
  # GET /courses/new.xml
  def new
    @course = Course.new
    @subjects = Subject.all

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
        format.html { render :action => "new" }
        format.xml  { render :xml => @course.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /courses/1
  # PUT /courses/1.xml
  def update
    @course = Course.find(params[:id])

    respond_to do |format|
      if @course.update_attributes(params[:course])
        flash[:notice] = 'Course was successfully updated.'
        format.html { redirect_to course_intervals_path(@course) }
        format.xml  { head :ok }
      else
        flash[:notice] = 'Target needs to be between 0 and 99.'
        format.html { render :action => "edit" }
#        format.html { redirect_to course_intervals_path(@course) }
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
      format.html { redirect_to(courses_url) }
      format.xml  { head :ok }
    end
  end
  
end
